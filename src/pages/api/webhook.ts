import { createClient } from '@supabase/supabase-js';

// Inicializa o Supabase com as suas chaves
const supabaseUrl = 'https://rzukzukevgjfgfzyzrkw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dWt6dWtldmdqZmdmenl6cmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDIwNzIsImV4cCI6MjA4NzE3ODA3Mn0.ajRDXsrSV6h4FKD6KgZzIHoSSX1X62fqZ9EJDzdlpRU';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  // Usar "any" nos parâmetros req e res é o jeito mais rápido de sumir o erro 
  // se você não tiver os tipos do Next ou Express instalados.

  const { query, body } = req;
  const topic = query.topic || body.type;

  try {
    if (topic === "payment") {
      const paymentId = query.id || (body.data && body.data.id);

      if (!paymentId) return res.status(400).send("ID não encontrado");

      // Consulta o Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      
      const data = await response.json();

      if (data.status === "approved") {
        // Atualiza no Supabase
        const { data: reserva, error: errorReserva } = await supabase
          .from('reservas')
          .update({ status: 'confirmado' })
          .eq('id_mercado_pago', paymentId.toString())
          .select('cliente_id')
          .single();

        if (reserva?.cliente_id) {
          // Soma fidelidade
          await supabase.rpc('incrementar_fidelidade', { 
            cli_id: reserva.cliente_id 
          });
        }
      }
    }

    return res.status(200).send("OK");
  } catch (err) {
    return res.status(500).send("Erro Interno");
  }
}