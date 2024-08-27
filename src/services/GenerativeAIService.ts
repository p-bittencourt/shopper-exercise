import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

export class GoogleAIService {
  private apiKey: string;
  public fileManager: GoogleAIFileManager;
  public genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.fileManager = new GoogleAIFileManager(apiKey);
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
}
