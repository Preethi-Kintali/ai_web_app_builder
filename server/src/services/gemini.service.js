import { generateContent } from '../config/gemini.config.js';

export const askGemini = async (prompt) => {
  try {
    const response = await generateContent(prompt);
    if (!response) {
      throw new Error('Gemini returned an empty response');
    }
    return response;
  } catch (error) {
    const err = new Error('AI generation failed. Please try again.');
    err.statusCode = 502;
    throw err;
  }
};
