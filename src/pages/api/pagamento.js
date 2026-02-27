const { MercadoPagoConfig, Payment } = require('mercadopago');

// Configure com seu ACCESS TOKEN DE TESTE (o que começa com TEST-)
const client = new MercadoPagoConfig({ 
  accessToken: 'APP_USR-5198926a-e4d9-4d1c-b285-eb10daa8a0d4' 
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
      payer: {
        email: email || 'test_user_123@testuser.com', // Email do comprador de teste
      },
    };

    try {
      const response = await payment.create({ body });
      
      // Retorna os dados necessários para o frontend mostrar o QR Code
      return res.status(200).json({
        copiaECola: response.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: response.point_of_interaction.transaction_data.qr_code_base64,
        idPagamento: response.id
      });
    } catch (error) {
      console.error("Erro MP:", error);
      return res.status(500).json({ error: 'Erro ao gerar PIX' });
    }
  } else {
    return res.status(405).json({ message: 'Método não permitido' });
  }
};