import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { slotId, valor, clienteNome, clienteId } = req.body;

    const payment = new Payment(client);
    
    const result = await payment.create({
      body: {
        transaction_amount: Number(valor),
        description: `Arena - Reserva Horário`,
        payment_method_id: 'pix',
        payer: { email: 'joao@email.com', first_name: clienteNome },
        // IMPORTANTE: URL que o Mercado Pago vai avisar quando o PIX for pago
        notification_url: "https://arena-cedro.vercel.app/api/webhook" 
      }
    });

    // Criar reserva no Supabase como 'pendente'
    await supabase.from('reservas').insert({
      id_mercado_pago: result.id,
      slot_id: slotId,
      cliente_id: clienteId,
      status: 'pendente'
    });

    res.status(200).json(result);
  }
}