const { MercadoPagoConfig, Payment } = require('mercadopago');

// Configure com seu ACCESS TOKEN DE TESTE (o que começa com TEST-)
const client = new MercadoPagoConfig({ 
  accessToken: 'TEST-8608772816287105-030117-eb7d2d719813f665080d20ab68d3c8fa-543569279' 
});

module.exports = async (req, res) => {
  // Habilita CORS para seu frontend conseguir chamar a API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { valor, email, descricao } = req.body;
    const payment = new Payment(client);

    const body = {
      transaction_amount: Number(valor),
      description: descricao || 'Reserva Arena Cedro',
      payment_method_id: 'pix',
      installments: 1,
      payer: {
        email: email || 'joao@email.com', // Email do comprador de teste
      },

      date_of_expiration: new Date(Date.now() + 30 * 60000).toISOString(),

      external_reference: `arena-${Date.now()}`,

    };

    try {

      const requestOptions = {
        idempotencyKey: `key-${Date.now()}`
      };
      
      const response = await payment.create({ body, requestOptions });
      
      return res.status(200).json({
        id: response.id,
        copiaECola: response.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: response.point_of_interaction.transaction_data.qr_code_base64,
        ticketUrl: response.point_of_interaction.transaction_data.ticket_url,
        idPagamento: response.id
      });
    } catch (error) {
      console.error("Erro MP Detalhado:", error.message);
      return res.status(500).json({ error: 'Erro ao gerar PIX', details: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Método não permitido' });
  }
};