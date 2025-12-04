import { TranslationMode, TextPurpose } from "../types";

export const inferContext = async (fullText: string): Promise<string> => {
    if (!fullText.trim()) return "";
    
    // Limit text to avoid unnecessary bandwidth, though server limits too.
    const textSample = fullText.slice(0, 50000); 

    try {
        const response = await fetch('/api/context', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fullText: textSample }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to infer context');
        }

        const data = await response.json();
        return data.context || "";
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
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            mode,
            targetAudience,
            context,
            purpose
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate translation');
    }

    const data = await response.json();
    return data.result || "";

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate translation. Please check your connection and try again.");
  }
};
