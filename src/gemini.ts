import { GoogleGenerativeAI } from '@google/generative-ai';

// Access the API key from Vite's environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set in the environment variables. Please check your .env file.");
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini 2.5 Flash model for fast, general-purpose text generation
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function askGemini(prompt: string) {
  try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
}