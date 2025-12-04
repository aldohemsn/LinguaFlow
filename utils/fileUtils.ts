// @ts-ignore
import mammoth from 'mammoth';

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (file.type === 'text/plain') {
    return await file.text();
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    file.name.endsWith('.docx')
  ) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error("Error parsing DOCX:", error);
      throw new Error("Failed to parse .docx file. Please ensure it is a valid Word document.");
    }
  } else {
    throw new Error('Unsupported file type. Please upload a .txt or .docx file.');
  }
};