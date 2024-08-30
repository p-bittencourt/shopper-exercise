import customers from '../models/testCustomers.js';
export default function handleGetCustomerMeasures(req, res) {
    const { customerCode } = req.params;
    let { measure_type } = req.query;
    // Lidar com o case
    if (measure_type) {
        measure_type = measure_type.toString().toUpperCase();
    }
    // Validar tipo passado no measure_type
    if (measure_type && !['WATER', 'GAS'].includes(measure_type)) {
        return res.status(400).json({
            error_code: 'INVALID_TYPE ',
            error_description: 'Tipo de medição não permitida',
        });
    }
    // Encontrar o cliente
    const customer = customers.find((c) => c.customer_code === customerCode);
    if (!customer) {
        return res.status(404).json({
            error_code: 'CUSTOMER_NOT_FOUND',
            error_description: 'Cliente não encontrado. ',
        });
    }
    // Filtrar medidas pelo tipo se measure_type foi informado
    let measures = customer.measures;
    if (measure_type) {
        measures = measures.filter((m) => m.measure_type === measure_type);
    }
    if (measures.length === 0) {
        return res.status(404).json({
            error_code: 'MEASURES_NOT_FOUND',
            error_description: 'Nenhuma leitura encontrada. ',
        });
    }
    return res.status(200).json({
        customer_code: customerCode,
        measures: measures,
    });
}
