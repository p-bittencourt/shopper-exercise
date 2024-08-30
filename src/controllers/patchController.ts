import { Request, Response } from 'express';
import customers from '../models/testCustomers.js';

interface PatchRequestBody {
  measure_uuid: string;
  confirmed_value: number;
}

interface ValidatedRequest {
  isValid: boolean;
  error_description?: string;
}

export default async function handlePatchConfirm(req: Request, res: Response) {
  // Aqui eu fiquei em dúvida, para salvar a leitura para o cliente, eu penso que precisaria também do customer_code enviado via request, para associar a medida ao cliente
  // Estou com alguns customers de teste em um array usando a estrutura sugerida do método GET/<customer code>/list, sem integração com banco de dados por enquanto
  // Além disso, o template de testCustomers não previa um valor salvo, então não conferi o valor da medida do PATCH, com a cadastrada nos testCustomers, porém seria simples de implementar caso necessário
  // Poderia também ter sido salvo inicialmente no POST /upload, com o measure.has_confirmed marcado como false, e então usar o PATCH para marcar o measure.has_confirmed como true
  // Também pensei sobre criar um array de medidas separado, usando as uuids como referência para associar com os customers, porém assim como o bd dos customers, não deu tempo de implementar
  // Então deixo essa abordagem simples aqui

  try {
    const { measure_uuid, confirmed_value }: PatchRequestBody = req.body;

    // 1. Validar entradas
    const validatedRequest = validateRequest({ measure_uuid, confirmed_value });

    if (!validatedRequest.isValid) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: validatedRequest.error_description,
      });
    }

    // 2. Validar se o código de leitura existe no sistema
    const validMeasureId = measureIdExists(measure_uuid);
    if (!validMeasureId) {
      return res.status(404).json({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura do mês não encontrada.',
      });
    }

    // 3. Verificar se o código de leitura já foi validado
    const measurePreviouslyConfirmed = confirmedMeasure(measure_uuid);
    if (measurePreviouslyConfirmed) {
      return res.status(409).json({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura do mês já realizada.',
      });
    }

    // 4. Salvar no banco de dados o código
    saveMeasure(measure_uuid);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro processando a confirmação:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function validateRequest(data: PatchRequestBody): ValidatedRequest {
  // Vamos validar os dados recebidos via PATCH e enviar as mensagens apropriadas
  const { measure_uuid, confirmed_value } = data;

  if (!measure_uuid || typeof measure_uuid !== 'string') {
    return {
      isValid: false,
      error_description: 'Fornecer identificação de medida válida.',
    };
  }

  if (!confirmed_value || isNaN(confirmed_value)) {
    return {
      isValid: false,
      error_description: 'Fornecer um valor para a leitura.',
    };
  }

  return { isValid: true };
}

function measureIdExists(measure_uuid: string): boolean {
  // Percorre os clientes e cada medição deles para conferir se já existe uma medição com essa id
  for (const customer of customers) {
    for (const measure of customer.measures) {
      if (measure.measure_uuid === measure_uuid) {
        return true;
      }
    }
  }

  return false;
}

function confirmedMeasure(measure_uuid: string): boolean {
  // Percorre os clientes e suas medidas
  for (const customer of customers) {
    for (const measure of customer.measures) {
      if (
        measure.measure_uuid === measure_uuid &&
        measure.has_confirmed === true
      ) {
        return true;
      }
    }
  }

  return false;
}

function saveMeasure(measure_uuid: string) {
  // Após passar pelas verificações nós transformamos o status .has_confirmed da measure em true
  for (const customer of customers) {
    for (const measure of customer.measures) {
      if (measure.measure_uuid === measure_uuid) {
        measure.has_confirmed = true;
      }
    }
  }
}
