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
    const { valor, email, descricao, reserva_id, cliente_id, tipo_pagamento, desconto_valor } =
      await req.json();

    const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpToken) {
      return new Response(
        JSON.stringify({ error: "Token do Mercado Pago não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Arredonda valor para 2 casas decimais para evitar erros de ponto flutuante
    // (ex: 50.0000001 virando 49.94 no Mercado Pago)
    const valorOriginal = Math.round(Number(valor) * 100) / 100;
    // SOMENTE aplica desconto quando o tipo for explicitamente "integral"
    // Para "adiantamento", "parcial" ou qualquer outro tipo: NÃO aplica desconto
    const desconto = tipo_pagamento === 'integral' && typeof desconto_valor === 'number'
      ? Math.round(desconto_valor * 100) / 100
      : 0;
    const valorComDescontoBruto = tipo_pagamento === 'integral'
      ? Math.max(valorOriginal - desconto, 0)
      : valorOriginal;
    const valorComDesconto = Math.round(valorComDescontoBruto * 100) / 100;

    // BLOQUEIO ANTI-DUPLICAÇÃO: se já existe um pagamento PIX pendente/pago para esta reserva,
    // não cria outro. Evita o caso de atendente clicando "Gerar PIX" várias vezes.
    if (reserva_id) {
      const supabaseCheck = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: existente } = await supabaseCheck
        .from("pagamentos")
        .select("id, codigo_pix, qr_code_base64, id_mercado_pago, valor, status")
        .eq("reserva_id", reserva_id)
        .eq("forma_pagamento", "pix")
        .in("status", ["pendente", "pago", "aprovado"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existente && existente.status !== "cancelado" && existente.status !== "expirado") {
        // Reaproveita o PIX já gerado em vez de criar um novo
        return new Response(
          JSON.stringify({
            id: existente.id_mercado_pago,
            copiaECola: existente.codigo_pix || "",
            qrCodeBase64: existente.qr_code_base64 || "",
            ticketUrl: "",
            valorPago: Number(existente.valor),
            valorOriginal: valorOriginal,
            desconto: desconto,
            valorRestante: 0,
            reaproveitado: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Descrição dinâmica
    const descricaoFinal = desconto > 0
      ? descricao || `Reserva Arena Cedro - Pagamento com desconto R$${desconto}`
      : descricao || "Reserva Arena Cedro - Pagamento PIX";

    // Cria pagamento PIX no Mercado Pago
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `arena-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
      body: JSON.stringify({
        transaction_amount: valorComDesconto > 0 ? valorComDesconto : valorOriginal,
        description: descricaoFinal,
        payment_method_id: "pix",
        installments: 1,
        payer: {
          email: email || "cliente@arena.com",
        },
        date_of_expiration: new Date(Date.now() + 8 * 60000).toISOString(),
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
    const valorFinalPago = valorComDesconto > 0 ? valorComDesconto : valorOriginal;

    // Salva o pagamento no banco
    if (reserva_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Para pagamento PARCIAL (dar baixa do financeiro), NÃO sobrescrever
      // valor_total nem valor_restante — o valor da reserva já está correto
      // e o restante será calculado a partir dos pagamentos.
      if (tipo_pagamento !== "parcial") {
        await supabase
          .from("reservas")
          .update({
            valor_sinal: valorFinalPago,
            valor_restante: 0,
            valor_total: valorOriginal,
          })
          .eq("id", reserva_id);
      }

      await supabase.from("pagamentos").insert([
        {
          reserva_id: reserva_id,
          valor: valorFinalPago,
          status: "pendente",
          tipo: tipo_pagamento || "integral",
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
        valorPago: valorFinalPago,
        valorOriginal: valorOriginal,
        desconto: desconto,
        valorRestante: 0,
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
