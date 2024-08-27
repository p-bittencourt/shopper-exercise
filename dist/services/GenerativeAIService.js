const { GoogleGenerativeAI } = require('@google/generative-ai');
export class GenerativeAIService {
    genAI;
    model;
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }
    initializeModel(modelName) {
        this.model = this.genAI.getGenerativeModel({ model: modelName });
    }
    async generateContent(prompt) {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}
