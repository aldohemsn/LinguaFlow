import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TranslationMode, TextPurpose } from "../types";

// Initialize the Gemini AI client
// NOTE: The API key is injected via the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models configuration
// Translator uses the lightweight Flash model for speed
const TRANSLATOR_MODEL = 'gemini-flash-lite-latest';
// Proofreader uses the capable Pro model for high-quality text manipulation and context inference
const PROOFREADER_MODEL = 'gemini-3-pro-preview';

const getPurposeInstruction = (purpose: TextPurpose) => {
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

const getTranslatorSystemPrompt = (context?: string, purpose?: TextPurpose) => `
You are a highly efficient Chinese-to-English translator. 
Your task is to provide a fast, accurate, and literal translation of the source text.
${purpose ? `\n[TEXT PURPOSE]\n${getPurposeInstruction(purpose)}\n` : ''}
${context ? `\n[CONTEXT FOR MEANING & ACCURACY]\n${context}\nIMPORTANT: Use this background information strictly to resolve ambiguities in the source text and ensure terminological accuracy.` : ''}
Preserve the original meaning strictly. 
Do not add explanations or notes. Just output the English text.
`;

const getProofreaderSystemPrompt = (targetAudience?: string, context?: string, purpose?: TextPurpose) => {
  const audienceInstruction = targetAudience 
    ? `ROLE: You are a representative of the target audience: "${targetAudience}". 
You are NOT just a translator or editor; you are a member of this audience group.
Your goal is to ensure the text resonates perfectly with you and your peers. 
Adopt the exact expectations, vocabulary, reading level, and stylistic preferences typical of "${targetAudience}".` 
    : "ROLE: You are a world-class English editor acting on behalf of general professional English readers.";

  return `
${audienceInstruction}
${purpose ? `\n[TEXT PURPOSE & STRATEGY]\n${getPurposeInstruction(purpose)}\n` : ''}
${context ? `\n[CONTEXT FOR TONE & STYLE]\n${context}\nIMPORTANT: Use this background information to determine the appropriate register, atmosphere, and stylistic nuances.` : ''}
Your task is to rewrite the provided English draft into professional, native-sounding English.
The input you receive is a literal translation from Chinese.
You must completely decouple yourself from any underlying Chinese syntax or structure that might remain in the draft.
Focus exclusively on English flow, tone, and idiomatic expression suitable for your role and the text's purpose.
Avoid "Chinglish" at all costs.
If the text is informal, keep it natural. If it's formal, make it polished.
Do not add explanations or notes. Just output the refined English text.
`;
};

export const inferContext = async (fullText: string): Promise<string> => {
    if (!fullText.trim()) return "";
    
    // Limit text to avoid token limits if the document is massive, 
    // though Gemini 1.5/2.5 contexts are huge, 30k chars is a safe "excerpt" heuristic for inference speed.
    const textSample = fullText.slice(0, 50000); 

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
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
        return response.text || "";
    } catch (error) {
        console.error("Context Inference Error:", error);
        throw new Error("Failed to infer context from the file.");
    }
}

export const generateTranslation = async (
  text: string,
  mode: TranslationMode,
  targetAudience?: string,
  context?: string,
  purpose: TextPurpose = TextPurpose.INFORMATIVE
): Promise<string> => {
  if (!text.trim()) return "";

  try {
    // Step 1: Generate Literal Translation (Flash Lite)
    const translatorResponse: GenerateContentResponse = await ai.models.generateContent({
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
        return draftText;
    }

    // Step 2: Proofreading (Pro)
    if (mode === TranslationMode.PROOFREADER) {
        if (!draftText.trim()) return "";

        const proofreaderResponse: GenerateContentResponse = await ai.models.generateContent({
            model: PROOFREADER_MODEL,
            contents: `Here is a draft translation: "${draftText}". \n\nPlease rewrite this to be natural and idiomatic.`,
            config: {
                systemInstruction: getProofreaderSystemPrompt(targetAudience, context, purpose),
                temperature: 0.7,
            }
        });
        
        return proofreaderResponse.text || "";
    }

    return "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate translation. Please check your connection and try again.");
  }
};