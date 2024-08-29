import 'dotenv/config';
import { GoogleAIService } from '../services/GenerativeAIService.js';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import customers from '../models/testCustomers.js';

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

interface ValidatedRequest {
  isValid: boolean;
  error_description?: string;
}

function validateRequest(data: UploadRequestBody): ValidatedRequest {
  const { image, customer_code, measure_datetime, measure_type } = data;

  if (!image) {
    return { isValid: false, error_description: 'Imagem é necessária.' };
  }

  if (!customer_code || typeof customer_code !== 'string') {
    return { isValid: false, error_description: 'Código do cliente inválido.' };
  }

  if (!measure_datetime || isNaN(Date.parse(measure_datetime))) {
    return { isValid: false, error_description: 'Data de medição inválida.' };
  }

  if (!['WATER', 'GAS'].includes(measure_type)) {
    return { isValid: false, error_description: 'Tipo de medição inválido.' };
  }

  // Validação da imagem base64
  const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return { isValid: false, error_description: 'Formato de imagem inválido.' };
  }

  return { isValid: true };
}

export default async function uploadImage(req: Request, res: Response) {
  try {
    const {
      image,
      customer_code,
      measure_datetime,
      measure_type,
    }: UploadRequestBody = req.body;

    // 1. Validar entradas
    const validatedRequest = validateRequest({
      image,
      customer_code,
      measure_datetime,
      measure_type,
    });

    if (!validatedRequest.isValid) {
      // TODO error_description method
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: validatedRequest.error_description,
      });
    } else {
      return res.status(200).json({ success: 'yep' });
    }

    /*
    // Extair o tipo da imagem e os dados base64
    const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Formato de imagem inválido. ' });
    }

    const imageType = matches[1];
    const base64dData = matches[2];

    // DESABILITAR A CONEXÃO COM O GEMINI DURANTE OS TESTES DAS OUTRAS ETAPAS
    const imageBuffer = Buffer.from(base64dData, 'base64');

    const imageName = `${customer_code}_${measure_datetime}_${measure_type}.${imageType}`;
    const imagePath = path.join(rootPath, 'uploads', imageName);

    // fs.writeFileSync(imagePath, imageBuffer);

    const imageUrl = `${req.protocol}://${req.get(
      'host'
    )}/uploads/${imageName}`;

    console.log('Image saved and accessible at:', imageUrl);

    // getMeasureAI(imagePath);

    */
  } catch (error) {
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
