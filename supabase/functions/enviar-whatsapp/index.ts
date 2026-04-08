import { corsHeaders } from '@supabase/supabase-js/cors'
import { z } from 'https://esm.sh/zod@3.22.4'

const MessageSchema = z.object({
  to: z.string().min(10).max(15),
  template: z.string().optional(),
  text: z.string().optional(),
  parameters: z.array(z.string()).optional(),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

    if (!WHATSAPP_TOKEN) {
      return new Response(JSON.stringify({ error: 'WHATSAPP_ACCESS_TOKEN não configurado' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (!WHATSAPP_PHONE_ID) {
      return new Response(JSON.stringify({ error: 'WHATSAPP_PHONE_NUMBER_ID não configurado' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    const parsed = MessageSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { to, template, text, parameters } = parsed.data
    const phoneFormatted = to.replace(/\D/g, '')

    let payload: Record<string, unknown>

    if (template) {
      // Template message (for initiating conversations)
      const components: Record<string, unknown>[] = []
      if (parameters && parameters.length > 0) {
        components.push({
          type: 'body',
          parameters: parameters.map(p => ({ type: 'text', text: p }))
        })
      }

      payload = {
        messaging_product: 'whatsapp',
        to: phoneFormatted,
        type: 'template',
        template: {
          name: template,
          language: { code: 'pt_BR' },
          ...(components.length > 0 ? { components } : {})
        }
      }
    } else if (text) {
      // Free-form text message (within 24h window)
      payload = {
        messaging_product: 'whatsapp',
        to: phoneFormatted,
        type: 'text',
        text: { body: text }
      }
    } else {
      return new Response(JSON.stringify({ error: 'Informe template ou text' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('WhatsApp API error:', JSON.stringify(data))
      return new Response(JSON.stringify({ error: 'Falha ao enviar mensagem', details: data }), {
        status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true, message_id: data.messages?.[0]?.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error:', error)
    const msg = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
