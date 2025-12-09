
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
  POLISH: 'POLISH',
  BACKGROUND_SUMMARY: 'BACKGROUND_SUMMARY',
  DECONSTRUCT: 'DECONSTRUCT',
  RECONSTRUCT: 'RECONSTRUCT'
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

**CRITICAL: BLIND EDITOR MODE**
- You must conceptually "blind" yourself to the source language structure. 
- Do NOT look for "equivalence" in sentence structure. Look for "equivalence" in impact and logic.
- If a sentence feels "translated" (translationese), REWRITE it completely.
- Focus exclusively on flow, tone, and idiomatic expression suitable for your role and the text's purpose.
- Do not add explanations or notes. Just output the refined text.
`;
};

// --- New Prompts for Professional Workflow ---

const getBackgroundSummaryPrompt = (globalContext?: string) => `
ROLE: You are a Senior Language Strategist & Domain Expert.
TASK: "Passage Contextualization" (Insight Mode).
${globalContext ? `GLOBAL DOCUMENT CONTEXT: "${globalContext}"\n(Use this to understand the broader domain, but focus your analysis on the specific PASSAGE below.)` : ""}
1. Read the provided text (Passage).
2. Identify the specific micro-domain (e.g., "Central Bank Collateral Frameworks" rather than just "Finance").
3. Define 3-5 Key Terms found in the text that are critical for accurate translation.
4. Flag any "False Friends" or potential ambiguity pitfalls.

OUTPUT FORMAT:
Provide a structured "Passage Insight" note.
- **Domain Context**: [1 sentence]
- **Key Definitions**: [Term]: [Definition in Context]
- **Pitfalls**: [Warning]
Keep it concise and actionable for a professional translator.
`;

const getDeconstructPrompt = (backgroundSummary: string, targetAudience?: string) => `
ROLE: You are the "Layman in the Loop" (Simulated Smart Non-Expert).
TASK: "Deep Deconstruction" (The Feynman Technique).
CONTEXT: ${backgroundSummary}
${targetAudience ? `TARGET AUDIENCE NOTE: The final translation is for "${targetAudience}", so the logic must be clear enough to eventually support that level of communication, but right now, explain it to ME (the Layman) simply.` : ""}
1. You are reading a complex professional text.
2. Your job is to explain what it *means* to a complete outsider (e.g., a grandmother or a high school student).
3. Do NOT translate word-for-word. Smash the sentence structures. Extract the LOGIC.
4. "Tell the story" of the passage in simple, colloquial language.
5. If the source says "collateral haircut", you explain "the bank takes a safety margin so they don't lose money if the asset drops in value".

LANGUAGE INSTRUCTION:
1. DETECT the language of the 'Source Text'.
2. SWITCH to the OPPOSITE language for your explanation (Target Language).
   - If Source is English -> Explain in lucid, simple Simplified Chinese.
   - If Source is Chinese -> Explain in lucid, simple English.
3. CRITICAL: The explanation MUST be in the Target Language.

OUTPUT FORMAT:
A paragraph of "Layman's Logic" in the TARGET LANGUAGE.
- Use analogies if helpful.
- **Verification Question**: End with one question to the professional (in the Target Language): "Did I understand [Complex Concept] correctly?"
`;

const getReconstructPrompt = (backgroundSummary: string, laymanLogic: string, targetAudience: string, purpose: string) => `
ROLE: You are a "Blind" Expert Editor & Translator.
TASK: "Passage Reconstruction" (Final Translation).

INPUTS:
1. **Verified Logic** (The SOURCE OF TRUTH for meaning):
   "${laymanLogic}"
   *(This logic has been verified by a human expert. Trust it implicitly for WHAT is being said.)*

2. **Context/Insights** (The SOURCE OF TRUTH for terminology):
   "${backgroundSummary}"
   *(Use these specific terms and domain context.)*

3. **Target Audience**: ${targetAudience || "Professional Readers"}
4. **Text Purpose**: ${purpose || "Informative"}

INSTRUCTIONS:
- Write the final text in the target language.
- **BLIND EDITOR MINDSET**: 
  - You do NOT have access to the original source text. 
  - You are writing this text from scratch based *only* on the "Verified Logic".
  - **LANGUAGE RULE**: The "Verified Logic" is already written in the TARGET LANGUAGE. Your output must be in the **SAME LANGUAGE** as the "Verified Logic".
  - Your goal is to express the "Verified Logic" with the "Context Terms" in the most natural, professional way possible.
- **Style**: Fluent, native-level professional, aligned with the "${purpose}" purpose.
- **Audience Adaptation**: tailoring vocabulary and tone for "${targetAudience}".

OUTPUT:
Only the final translated text. No notes.
`;


// --- API Routes ---

// POST /api/verify - Dedicated Auth Check
app.post('/api/verify', authMiddleware, (req, res) => {
  res.status(200).json({ valid: true });
});

// POST /api/generate
app.post('/api/generate', authMiddleware, async (req, res) => {
  const { text, mode, targetAudience, context, purpose } = req.body;

  if (!text) {
    res.status(400).json({ message: 'Missing text' });
    return;
  }

  try {
    let draftText = text;

    // Step 1: Insight Mode (Contextualization)
    if (mode === TranslationMode.BACKGROUND_SUMMARY) {
      // Pass the global 'context' (if any) to help ground the summary
      const summaryResponse = await ai.models.generateContent({
        model: PROOFREADER_MODEL,
        contents: `TEXT TO ANALYZE: "${text}"`,
        config: {
          systemInstruction: getBackgroundSummaryPrompt(context),
          temperature: 0.3,
        }
      });
      res.status(200).json({ result: summaryResponse.text || "" });
      return;
    }

    if (mode === TranslationMode.DECONSTRUCT) {
      // Here 'context' argument should hold the Background Summary
      const deconstructResponse = await ai.models.generateContent({
        model: PROOFREADER_MODEL,
        contents: `SOURCE TEXT: "${text}"`,
        config: {
          systemInstruction: getDeconstructPrompt(context || "", targetAudience),
          temperature: 0.4,
        }
      });
      res.status(200).json({ result: deconstructResponse.text || "" });
      return;
    }

    if (mode === TranslationMode.RECONSTRUCT) {
      // STRICT ISOLATION: Do NOT pass the source 'text' to the model.
      // We rely entirely on the System Instruction which contains the verified logic.

      const reconstructResponse = await ai.models.generateContent({
        model: PROOFREADER_MODEL,
        contents: `Please generate the final text based on the Verified Logic provided in the system instructions.`,
        config: {
          systemInstruction: getReconstructPrompt(context || "No context", "", targetAudience, purpose),
          temperature: 0.3,
        }
      });
      res.status(200).json({ result: reconstructResponse.text || "" });
      return;
    }

    if (mode !== TranslationMode.POLISH && mode !== TranslationMode.PROOFREADER) {
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
\n
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
