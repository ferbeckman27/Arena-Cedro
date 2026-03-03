import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Valida assinatura HMAC do Mercado Pago
async function validarAssinatura(req: Request): Promise<boolean> {
  const secret = Deno.env.get("MP_WEBHOOK_SECRET");
  if (!secret) {
    console.warn("MP_WEBHOOK_SECRET não configurado, pulando validação");
    return true; // Se não tem secret, aceita (para dev)
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");

  if (!xSignature || !xRequestId) {
    console.error("Headers de assinatura ausentes");
    return false;
  }

  // Parse x-signature: "ts=...,v1=..."
  const parts: Record<string, string> = {};
  xSignature.split(",").forEach((part) => {
    const [key, value] = part.split("=");
    if (key && value) parts[key.trim()] = value.trim();
  });

  const ts = parts["ts"];
  const v1 = parts["v1"];

  if (!ts || !v1) {
    console.error("Formato de x-signature inválido");
    return false;
  }

  // Obtém o data.id da query string
  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("id") || "";

  // Monta o template: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Gera HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
  const hashHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hashHex !== v1) {
    console.error("Assinatura inválida!", { expected: hashHex, received: v1 });
    return false;
  }

  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validar assinatura
    const assinaturaValida = await validarAssinatura(req);
    if (!assinaturaValida) {
      console.error("Webhook rejeitado: assinatura inválida");
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

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

        if (pagamento.tipo === "sinal") {
          updateData.status = "confirmada";
        }

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
        await supabase
          .from("pagamentos")
          .update({ status: "cancelado" })
          .eq("id_mercado_pago", String(paymentId));
      }
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return new Response("OK", { status: 200, headers: corsHeaders });
  }
});
