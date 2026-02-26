import { createClient } from '@supabase/supabase-js';

// Inicializa o Supabase com as suas chaves
const supabaseUrl = 'https://rzukzukevgjfgfzyzrkw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dWt6dWtldmdqZmdmenl6cmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDIwNzIsImV4cCI6MjA4NzE3ODA3Mn0.ajRDXsrSV6h4FKD6KgZzIHoSSX1X62fqZ9EJDzdlpRU';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  const { query, body } = req;
  
  // O Mercado Pago pode enviar como 'topic' na query ou 'type' no body
  const topic = query.topic || body.type;

  try {
    if (topic === "payment") {
      const paymentId = query.id || (body.data && body.data.id);
      if (!paymentId) return res.status(400).send("ID não encontrado");

      // 1. Consulta o status real no Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      
      if (!response.ok) throw new Error("Falha na comunicação com Mercado Pago");
      const data = await response.json();

      // 2. Se o pagamento foi aprovado (Approved)
      if (data.status === "approved") {
        
        // A) Atualiza a tabela PAGAMENTOS
        const { data: pagamento, error: errorPag } = await supabase
          .from('pagamentos')
          .update({ 
            status: 'pago', 
            data_confirmacao: new Date().toISOString() 
          })
          .eq('id_mercado_pago', paymentId.toString())
          .select('reserva_id')
          .single();

        if (errorPag || !pagamento) {
          console.error("Pagamento não encontrado no banco:", paymentId);
          return res.status(200).send("Pagamento ignorado (não encontrado)");
        }

        // B) Atualiza a tabela RESERVAS vinculada
        const { data: reserva, error: errorRes } = await supabase
          .from('reservas')
          .update({ 
            status: 'confirmado', 
            pago: true,
            data_pagamento: new Date().toISOString()
          })
          .eq('id', pagamento.reserva_id)
          .select('cliente_id')
          .single();

        // C) Incrementa a fidelidade do cliente
        if (reserva?.cliente_id) {
          await supabase.rpc('incrementar_fidelidade', { 
            cli_id: reserva.cliente_id 
          });
        }
      }
    }

    // Sempre responda 200 para o Mercado Pago não reenviar a mesma notificação
    return res.status(200).send("OK");

  } catch (err: any) {
    console.error("Erro no Webhook:", err.message);
    return res.status(500).send("Erro Interno");
 }
}