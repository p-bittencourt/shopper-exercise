import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
export class GoogleAIService {
    apiKey;
    fileManager;
    genAI;
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.fileManager = new GoogleAIFileManager(apiKey);
        this.genAI = new GoogleGenerativeAI(apiKey);
    }
}
