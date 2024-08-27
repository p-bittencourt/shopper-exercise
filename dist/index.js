import 'dotenv/config';
// import { GenerativeAIService } from './services/GenerativeAIService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import express from 'express';
const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY || '';
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
async function run() {
    // Google AI File Manager and Generative AI
    const fileManager = new GoogleAIFileManager(apiKey);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    // Upload file
    const uploadResponse = await fileManager.uploadFile('./src/hidro-1.png', {
        mimeType: 'image/png',
        displayName: 'Hidrometro',
    });
    const result = await model.generateContent([
        {
            fileData: {
                mimeType: uploadResponse.file.mimeType,
                fileUri: uploadResponse.file.uri,
            },
        },
        {
            text: 'Faça a leitura do hidrômetro e retorne apenas o valor lido em formato "integer"',
        },
    ]);
    console.log(result.response.text());
}
run();
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
