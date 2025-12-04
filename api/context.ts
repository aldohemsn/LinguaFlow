import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const PROOFREADER_MODEL = 'gemini-3-pro-preview';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { fullText } = req.body;

  if (!fullText) {
     // Allow empty context if text is empty
    return res.status(200).json({ context: "" });
  }

  // Limit text to avoid massive payloads, although client likely did it too. 
  // Safety check on server side.
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

    return res.status(200).json({ context: response.text || "" });

  } catch (error) {
    console.error("Context Inference Error:", error);
    return res.status(500).json({ message: 'Failed to infer context', error: error.message });
  }
}
