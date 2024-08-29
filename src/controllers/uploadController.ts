import 'dotenv/config';
import { GoogleAIService } from '../services/GenerativeAIService.js';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const apiKey = process.env.GEMINI_API_KEY || '';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.join(__dirname, '..', '..');

interface UploadRequestBody {
  image: string;
  customer_code: string;
  measure_datetime: string;
  measure_type: 'WATER' | 'GAS';
}

export default async function uploadImage(req: Request, res: Response) {
  const {
    image,
    customer_code,
    measure_datetime,
    measure_type,
  }: UploadRequestBody = req.body;

  try {
    if (!image) {
      return res.status(400).json({ error: 'Imagem é necessária.' });
    }

    // Extair o tipo da imagem e os dados base64
    const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Formato de imagem inválido. ' });
    }

    const imageType = matches[1];
    const base64dData = matches[2];
    const imageBuffer = Buffer.from(base64dData, 'base64');

    const imageName = `${customer_code}_${measure_datetime}_${measure_type}.${imageType}`;
    const imagePath = path.join(rootPath, 'uploads', imageName);

    fs.writeFileSync(imagePath, imageBuffer);

    const imageUrl = `${req.protocol}://${req.get(
      'host'
    )}/uploads/${imageName}`;

    console.log('Image saved and accessible at:', imageUrl);

    getMeasureAI(imagePath);
  } catch (error) {
    console.error('Erro ao processar a imagem', error);
    return res.status(500).json({ error: 'Falha ao fazer o envio da imagem.' });
  }
}

async function getMeasureAI(imagePath: string) {
  // Google AI File Manager and Generative AI
  const googleAIService = new GoogleAIService(apiKey);

  // Upload file and configure model
  const uploadResponse = await googleAIService.fileManager.uploadFile(
    imagePath,
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
