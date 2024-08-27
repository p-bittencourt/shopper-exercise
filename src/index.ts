import 'dotenv/config';
import { GoogleAIService } from './services/GenerativeAIService.js';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY || '';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function run() {
  // Google AI File Manager and Generative AI
  const googleAIService = new GoogleAIService(apiKey);

  // Upload file and configure model
  const uploadResponse = await googleAIService.fileManager.uploadFile(
    './src/hidro-1.png',
    {
      mimeType: 'image/png',
      displayName: 'Hidrometro',
    }
  );
  const model = googleAIService.genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  // Get Gemini result
  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri,
      },
    },
    {
      text: 'Descreva o produto que você está vendo',
    },
  ]);

  console.log(result.response.text());
}

run().catch(console.error);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
