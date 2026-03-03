import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { valor, email, descricao, reserva_id, cliente_id, tipo_pagamento } =
      await req.json();

    const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpToken) {
      return new Response(
        JSON.stringify({ error: "Token do Mercado Pago não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calcula 50% do valor (sinal)
    const valorSinal = Number(valor) * 0.5;

    // Cria pagamento PIX no Mercado Pago
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `arena-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
      body: JSON.stringify({
        transaction_amount: valorSinal,
        description: descricao || "Reserva Arena Cedro - Sinal 50%",
        payment_method_id: "pix",
        installments: 1,
        payer: {
          email: email || "cliente@arena.com",
        },
        date_of_expiration: new Date(Date.now() + 30 * 60000).toISOString(),
        external_reference: reserva_id ? `reserva-${reserva_id}` : `arena-${Date.now()}`,
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/webhook-mercadopago`,
      }),
    });

    if (!mpResponse.ok) {
      const errData = await mpResponse.text();
      console.error("Erro MP:", errData);
      return new Response(
        JSON.stringify({ error: "Erro ao criar pagamento PIX", details: errData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mpData = await mpResponse.json();

    // Salva o pagamento no banco
    if (reserva_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Atualiza a reserva com os valores de sinal
      await supabase
        .from("reservas")
        .update({
          valor_sinal: valorSinal,
          valor_restante: Number(valor) - valorSinal,
        })
        .eq("id", reserva_id);

      // Insere o registro de pagamento
      await supabase.from("pagamentos").insert([
        {
          reserva_id: reserva_id,
          valor: valorSinal,
          status: "pendente",
          tipo: tipo_pagamento || "sinal",
          forma_pagamento: "pix",
          id_mercado_pago: String(mpData.id),
          codigo_pix:
            mpData.point_of_interaction?.transaction_data?.qr_code || "",
          qr_code_base64:
            mpData.point_of_interaction?.transaction_data?.qr_code_base64 || "",
        },
      ]);
    }

    return new Response(
      JSON.stringify({
        id: mpData.id,
        copiaECola:
          mpData.point_of_interaction?.transaction_data?.qr_code || "",
        qrCodeBase64:
          mpData.point_of_interaction?.transaction_data?.qr_code_base64 || "",
        ticketUrl:
          mpData.point_of_interaction?.transaction_data?.ticket_url || "",
        valorSinal: valorSinal,
        valorTotal: Number(valor),
        valorRestante: Number(valor) - valorSinal,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro geral:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
