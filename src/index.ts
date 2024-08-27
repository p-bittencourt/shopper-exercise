import express from 'express';
import 'dotenv/config';
const { GoogleGenerativeAI } = require('@google/generative-ai');

interface IGenerativeAIService {
  initializeModel(modelName: string): void;
  generateContent(prompt: string): Promise<string>;
}

class GenerativeAIService implements IGenerativeAIService {
  private genAI: any;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  initializeModel(modelName: string): void {
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async generateContent(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
