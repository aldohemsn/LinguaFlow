import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting LinguaFlow server...");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for large text

// Serve static files from the 'dist' directory
const distPath = path.resolve(__dirname, '../dist');
console.log(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// --- Authentication Middleware ---
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const envPassphrase = process.env.PASSPHRASE;

  if (!envPassphrase) {
    console.warn("WARNING: PASSPHRASE environment variable not set. Authentication disabled.");
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (token !== envPassphrase) {
    res.status(401).json({ message: 'Unauthorized: Invalid passphrase' });
    return;
  }

  next();
};

// --- Gemini API Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const TRANSLATOR_MODEL = 'gemini-2.5-flash-lite';
const PROOFREADER_MODEL = 'gemini-2.5-pro';

// --- Shared Constants ---
const TextPurpose = {
  INFORMATIVE: 'INFORMATIVE',
  EXPRESSIVE: 'EXPRESSIVE',
  OPERATIVE: 'OPERATIVE'
};

const TranslationMode = {
  TRANSLATOR: 'TRANSLATOR',
  PROOFREADER: 'PROOFREADER',
  POLISH: 'POLISH'
};

// --- Helper Functions ---
const getPurposeInstruction = (purpose: string) => {
  switch (purpose) {
    case TextPurpose.INFORMATIVE:
      return "PRIMARY GOAL: ACCURACY & CLARITY. This is an 'Informative Text' (Reiss). Focus on conveying facts, knowledge, and information accurately. Maintain a neutral, objective, and clear tone.";
    case TextPurpose.EXPRESSIVE:
      return "PRIMARY GOAL: AESTHETICS & STYLE. This is an 'Expressive Text' (Reiss). Focus on the artistic form, the author's voice, and stylistic nuances. The translation should be evocative and preserve the aesthetic appeal of the original.";
    case TextPurpose.OPERATIVE:
      return "PRIMARY GOAL: PERSUASION & IMPACT. This is an 'Operative Text' (Reiss). Focus on the appeal to the reader. The translation must be persuasive, engaging, and designed to elicit a specific response or action from the audience.";
    default:
      return "";
  }
};

const getTranslatorSystemPrompt = (context: string, purpose: string) => `
You are a highly efficient bilingual translator (English <-> Chinese). 
Your task is to detect the source language and provide a fast, accurate, and literal translation into the target language.
- If Source is Chinese -> Target is English.
- If Source is English -> Target is Simplified Chinese.

${purpose ? `
[TEXT PURPOSE]
${getPurposeInstruction(purpose)}
` : ''}
${context ? `
[CONTEXT FOR MEANING & ACCURACY]
${context}
IMPORTANT: Use this background information strictly to resolve ambiguities in the source text and ensure terminological accuracy.` : ''}
Preserve the original meaning strictly. 
Do not add explanations or notes. Just output the translated text.
`;

const getProofreaderSystemPrompt = (targetAudience: string, context: string, purpose: string) => {
  const audienceInstruction = targetAudience 
    ? `ROLE: You are a representative of the target audience: "${targetAudience}". 
You are NOT just a translator or editor; you are a member of this audience group.
You are to ensure the text resonates perfectly with you and your peers.
Adopt the exact expectations, vocabulary, reading level, and stylistic preferences typical of "${targetAudience}".` 
    : "ROLE: You are a world-class editor acting on behalf of general professional readers.";

  return `
${audienceInstruction}
${purpose ? `
[TEXT PURPOSE & STRATEGY]
${getPurposeInstruction(purpose)}
` : ''}
${context ? `
[CONTEXT FOR TONE & STYLE]
${context}
IMPORTANT: Use this background information to determine the appropriate register, atmosphere, and stylistic nuances.` : ''}
Your task is to rewrite the provided draft translation into professional, native-sounding text in the target language.
The input is a draft translation.
1. Detect the language of the input draft.
2. If English: Refine it to be native-level English.
3. If Chinese: Refine it to be native-level Simplified Chinese.

You must completely decouple yourself from any underlying syntax or structure of the original source language that might remain in the draft.
Focus exclusively on flow, tone, and idiomatic expression suitable for your role and the text's purpose.
Avoid "translationese" at all costs.
If the text is informal, keep it natural. If it's formal, make it polished.
Do not add explanations or notes. Just output the refined text.
`;
};


// --- API Routes ---

// POST /api/generate
app.post('/api/generate', authMiddleware, async (req, res) => {
  const { text, mode, targetAudience, context, purpose } = req.body;

  if (!text) {
    res.status(400).json({ message: 'Missing text' });
    return;
  }

  try {
    let draftText = text;

    // Step 1: Generate Literal Translation (Flash Lite) - Only if NOT in POLISH mode
    if (mode !== TranslationMode.POLISH) {
        const translatorResponse = await ai.models.generateContent({
        model: TRANSLATOR_MODEL,
        contents: text,
        config: {
            systemInstruction: getTranslatorSystemPrompt(context, purpose),
            temperature: 0.3,
        }
        });
        draftText = translatorResponse.text || "";
    }

    // If mode is TRANSLATOR, we are done
    if (mode === TranslationMode.TRANSLATOR) {
        res.status(200).json({ result: draftText });
        return;
    }

    // Step 2: Proofreading (Pro) - For PROOFREADER and POLISH modes
    if (mode === TranslationMode.PROOFREADER || mode === TranslationMode.POLISH) {
        if (!draftText.trim()) {
            res.status(200).json({ result: "" });
            return;
        }

        const proofreaderResponse = await ai.models.generateContent({
            model: PROOFREADER_MODEL,
            contents: `Here is a draft translation: "${draftText}". 

Please rewrite this to be natural and idiomatic.`, 
            config: {
                systemInstruction: getProofreaderSystemPrompt(targetAudience, context, purpose),
                temperature: 0.7,
            }
        });
        
        res.status(200).json({ result: proofreaderResponse.text || "" });
        return;
    }

    res.status(400).json({ message: 'Invalid mode' });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ message: 'Failed to generate translation', error: error.message });
  }
});

// POST /api/context
app.post('/api/context', authMiddleware, async (req, res) => {
  const { fullText } = req.body;

  if (!fullText) {
     // Allow empty context if text is empty
    res.status(200).json({ context: "" });
    return;
  }

  const textSample = fullText.slice(0, 50000);

  try {
    const response = await ai.models.generateContent({
        model: PROOFREADER_MODEL,
        contents: `Analyze the following text (which is a full document or a large excerpt). 
        Identify the core topic, the document type (e.g., technical manual, novel, legal contract), the intended audience, and the general tone. 
        Summarize this "Translation Context" in one concise paragraph (under 100 words) to help a translator understand the background.
        
        Text:
        "${textSample}"`,
        config: {
            temperature: 0.5,
        }
    });

    res.status(200).json({ context: response.text || "" });

  } catch (error: any) {
    console.error("Context Inference Error:", error);
    res.status(500).json({ message: 'Failed to infer context', error: error.message });
  }
});


// Catch-all route to serve the React app for any other request (SPA support)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
