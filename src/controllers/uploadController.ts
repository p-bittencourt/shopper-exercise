import 'dotenv/config';
import { GoogleAIService } from '../services/GenerativeAIService.js';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import customers from '../models/testCustomers.js';
import { v4 as uuidv4 } from 'uuid';

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

interface ExistingMeasure {
  validClient: boolean;
  validMeasure?: boolean;
  error_description?: string;
}

interface ProcessImageResponse {
  imagePath: string;
  imageUrl: string;
}

export default async function handlePostUpload(req: Request, res: Response) {
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
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: validatedRequest.error_description,
      });
    }

    // 2. Validar leitura
    const hasExistingMeasure = checkExistingMeasure(
      customer_code,
      measure_datetime,
      measure_type
    );

    if (!hasExistingMeasure.validClient) {
      return res.status(408).json({
        error_code: 'CLIENT_NOT_FOUND',
        error_description: hasExistingMeasure.error_description,
      });
    } else if (!hasExistingMeasure.validMeasure) {
      return res.status(409).json({
        error_code: 'DOUBLE_REPORT',
        error_description: hasExistingMeasure.error_description,
      });
    }

    // 3. Processamento da imagem
    const imageData = await processImage(
      image,
      customer_code,
      measure_datetime,
      measure_type,
      req
    );

    // 4. Realização da leitura via IA
    const aiResult = await getMeasureAI('./src/hidro-1.png'); // Usando essa para testes o  real será imageData.imagePath

    // 5. Limpeza da leitura via IA para deixar apenas o valor em inteiro e registro de uma uuid para a medida
    const numericValue = aiResult.match(/\d+/g)?.join('') || '';
    let numericValueInt = parseInt(numericValue, 10);
    const measureId = uuidv4();

    if (isNaN(numericValueInt)) {
      numericValueInt = 0;
    }

    return res.status(200).json({
      image_url: imageData.imageUrl,
      measure_value: numericValueInt,
      measure_uuid: measureId,
    });
  } catch (error) {
    console.error('Erro processando upload:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function validateRequest(data: UploadRequestBody): ValidatedRequest {
  // Nesta função vamos validar os dados recebidos via POST e enviar mensagens apropriadas
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

function checkExistingMeasure(
  customer_code: string,
  measure_datetime: string,
  measure_type: 'WATER' | 'GAS'
): ExistingMeasure {
  // Estou utilizando um array de customers no meu código para testes, não um bd.
  const customer = customers.find((c) => c.customer_code === customer_code);
  // Verifica se o cliente está cadastrado
  if (!customer) {
    return {
      validClient: false,
      error_description: 'Código de cliente não encontrado.',
    };
  }

  // Extrai o mês e o ano da medida
  const measureMonth = new Date(measure_datetime).getMonth();
  const measureYear = new Date(measure_datetime).getFullYear();

  // Verifica se já existe a medida para o mesmo mês, ano e tipo
  const existingMeasure = customer.measures.find((m) => {
    const existingMonth = new Date(m.measure_datetime).getMonth();
    const existingYear = new Date(m.measure_datetime).getFullYear();

    return (
      existingMonth === measureMonth &&
      existingYear === measureYear &&
      m.measure_type === measure_type
    );
  });

  // Se encontrar uma medida correspondente, retorna erro e uma mensagem apropriada
  if (existingMeasure) {
    return {
      validClient: true,
      validMeasure: false,
      error_description: `Já existe uma leitura de ${measure_type} para ${
        measureMonth + 1
      }/${measureYear}`,
    };
  }

  // Se o cliente é válido e não houver medida correspondente, retorna true
  return { validClient: true, validMeasure: true };
}

async function processImage(
  image: string,
  customer_code: string,
  measure_datetime: string,
  measure_type: 'WATER' | 'GAS',
  req: Request
): Promise<ProcessImageResponse> {
  // Extraímos as informações da imagem base64
  const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
  const imageType = matches![1];
  const base64dData = matches![2];

  // Criamos um buffer da imagem, para salvá-la no diretório apropriado
  const imageBuffer = Buffer.from(base64dData, 'base64');
  const imageName = `${customer_code}_${measure_datetime}_${measure_type}.${imageType}`;
  const imagePath = path.join(rootPath, 'uploads', imageName);
  // fs.writeFileSync(imagePath, imageBuffer); desativado durante os testes

  // URL da imagem para outros requests, em um projeto de produção ela poderia ser adicionada ao modelo da leitura para facilitar o acesso
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imageName}`;

  // Retorno o caminho da imagem para poder passá-lo para a função que integra com o Gemini
  return { imagePath: imagePath, imageUrl: imageUrl };
}

async function getMeasureAI(imagePath: string): Promise<string> {
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
      text: 'Retorne apenas o valor da leitura da medição desse relógio.',
    },
  ]);

  return result.response.text();
}
