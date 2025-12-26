import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/safe_smtp/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, subject, html, fromName } = await req.json()

        const client = new SmtpClient()

        await client.connect({
            hostname: Deno.env.get('SMTP_HOST') || 'smtp.gmail.com',
            port: Number(Deno.env.get('SMTP_PORT')) || 587,
            username: Deno.env.get('SMTP_USER'),
            password: Deno.env.get('SMTP_PASS'),
            tls: true,
        })

        await client.send({
            from: `"${fromName || Deno.env.get('SMTP_FROM_NAME') || '323 Network'}" <${Deno.env.get('SMTP_FROM_EMAIL')}>`,
            to,
            subject,
            content: html,
            html: html,
        })

        await client.close()

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
