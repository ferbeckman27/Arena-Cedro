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
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Query params only
    }

    const paymentTopic = topic || body.type;
    const paymentId =
      url.searchParams.get("id") || (body.data && body.data.id);

    console.log("Webhook recebido:", { paymentTopic, paymentId });

    if (paymentTopic === "payment" && paymentId) {
      const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
      if (!mpToken) {
        console.error("MP_ACCESS_TOKEN não configurado");
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Consulta status real no Mercado Pago
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${mpToken}` } }
      );

      if (!mpResponse.ok) {
        console.error("Erro ao consultar MP:", await mpResponse.text());
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      const mpData = await mpResponse.json();
      console.log("Status MP:", mpData.status, "ID:", paymentId);

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      if (mpData.status === "approved") {
        // 1. Atualiza pagamento
        const { data: pagamento, error: errPag } = await supabase
          .from("pagamentos")
          .update({
            status: "pago",
            data_confirmacao: new Date().toISOString(),
          })
          .eq("id_mercado_pago", String(paymentId))
          .select("reserva_id, tipo, valor")
          .single();

        if (errPag || !pagamento) {
          console.error("Pagamento não encontrado:", paymentId, errPag);
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        console.log("Pagamento confirmado, reserva:", pagamento.reserva_id);

        // 2. Atualiza reserva
        const updateData: any = {
          valor_pago_sinal: pagamento.valor,
          data_pagamento: new Date().toISOString(),
        };

        // Se é sinal (50%), marca como confirmada
        if (pagamento.tipo === "sinal") {
          updateData.status = "confirmada";
        }

        // Se é pagamento restante, marca como pago total
        if (pagamento.tipo === "restante") {
          updateData.pago = true;
          updateData.status = "confirmada";
        }

        const { data: reserva } = await supabase
          .from("reservas")
          .update(updateData)
          .eq("id", pagamento.reserva_id)
          .select("cliente_id")
          .single();

        // 3. Incrementa fidelidade
        if (reserva?.cliente_id) {
          await supabase.rpc("incrementar_fidelidade", {
            cli_id: reserva.cliente_id,
          });
        }
      } else if (
        mpData.status === "cancelled" ||
        mpData.status === "rejected"
      ) {
        // Marca como cancelado
        await supabase
          .from("pagamentos")
          .update({ status: "cancelado" })
          .eq("id_mercado_pago", String(paymentId));
      }
    }

    // Sempre responde 200 para o MP não reenviar
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return new Response("OK", { status: 200, headers: corsHeaders });
  }
});
