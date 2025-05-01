// utils/summarizer.js
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizePRChanges(diffUrl) {
  const input = `Summarize the changes in the PR diff at this URL: ${diffUrl}`;

  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: input },
    ],
  });

  return response.choices[0].message.content.trim();
}
