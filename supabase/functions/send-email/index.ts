import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        const { to, subject, html, fromName } = body

        const smtpHost = Deno.env.get('SMTP_HOST')
        const smtpPortStr = Deno.env.get('SMTP_PORT')
        const smtpUser = Deno.env.get('SMTP_USER')
        const smtpPass = Deno.env.get('SMTP_PASS')
        const smtpFromEmail = Deno.env.get('SMTP_FROM_EMAIL') || smtpUser
        const smtpFromName = fromName || Deno.env.get('SMTP_FROM_NAME') || '323 Network'

        const missingVars = []
        if (!smtpHost) missingVars.push('SMTP_HOST')
        if (!smtpPortStr) missingVars.push('SMTP_PORT')
        if (!smtpUser) missingVars.push('SMTP_USER')
        if (!smtpPass) missingVars.push('SMTP_PASS')

        if (missingVars.length > 0) {
            throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
        }

        const smtpPort = Number(smtpPortStr)

        console.log(`Attempting to send email to ${to} via ${smtpHost}:${smtpPort}`)

        const client = new SmtpClient()

        await client.connect({
            hostname: smtpHost,
            port: smtpPort,
            username: smtpUser,
            password: smtpPass,
        })

        await client.send({
            from: `"${smtpFromName}" <${smtpFromEmail}>`,
            to,
            subject,
            content: html,
            html: html,
        })

        await client.close()
        console.log('Email sent successfully')

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error('SMTP Error:', error.message)
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack,
            message: "Verify your SMTP secrets in Supabase Dashboard"
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
