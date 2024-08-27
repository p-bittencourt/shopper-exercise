const { GoogleGenerativeAI } = require('@google/generative-ai');

interface IGenerativeAIService {
  initializeModel(modelName: string): void;
  generateContent(prompt: string): Promise<string>;
}

export class GenerativeAIService implements IGenerativeAIService {
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
