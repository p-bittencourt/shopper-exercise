import 'dotenv/config';
import app from './app';
import { GenerativeAIService } from './services/GenerativeAIService';

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  const genAIService = new GenerativeAIService(apiKey);
  genAIService.initializeModel('gemini-1.5-flash');

  const prompt = 'Write a short story about a magic backpack.';
  const text = await genAIService.generateContent(prompt);
  console.log(text);
}

run();
