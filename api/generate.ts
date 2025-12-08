import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TRANSLATOR_MODEL = 'gemini-2.5-flash-lite';
// Proofreader and context inference use the capable Pro model for high-quality text manipulation and context inference
const PROOFREADER_MODEL = 'gemini-2.5-pro';

// Re-defined here to avoid relative import issues in serverless environment
const TextPurpose = {
  INFORMATIVE: 'INFORMATIVE',
  EXPRESSIVE: 'EXPRESSIVE',
  OPERATIVE: 'OPERATIVE'
};

const TranslationMode = {
  TRANSLATOR: 'TRANSLATOR',
  PROOFREADER: 'PROOFREADER'
};

const getPurposeInstruction = (purpose) => {
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

const getTranslatorSystemPrompt = (context, purpose) => `
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

const getProofreaderSystemPrompt = (targetAudience, context, purpose) => {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text, mode, targetAudience, context, purpose } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Missing text' });
  }

  try {
    // Step 1: Generate Literal Translation (Flash Lite)
    const translatorResponse = await ai.models.generateContent({
      model: TRANSLATOR_MODEL,
      contents: text,
      config: {
        systemInstruction: getTranslatorSystemPrompt(context, purpose),
        temperature: 0.3,
      }
    });

    const draftText = translatorResponse.text || "";

    // If mode is TRANSLATOR, we are done
    if (mode === TranslationMode.TRANSLATOR) {
        return res.status(200).json({ result: draftText });
    }

    // Step 2: Proofreading (Pro)
    if (mode === TranslationMode.PROOFREADER) {
        if (!draftText.trim()) {
            return res.status(200).json({ result: "" });
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
        
        return res.status(200).json({ result: proofreaderResponse.text || "" });
    }

    return res.status(400).json({ message: 'Invalid mode' });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ message: 'Failed to generate translation', error: error.message });
  }
}
