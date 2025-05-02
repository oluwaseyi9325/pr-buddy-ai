// utils/summarizer.js
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function summarizePRChanges(diffUrl) {
  const input = `Summarize the changes in the PR diff at this URL: ${diffUrl}`;

  try {
    // Make the request to Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001', // Specify the Gemini model you want to use
      contents: input,
    });

    // Return the generated text
    return response.text.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to summarize PR changes');
  }
}
