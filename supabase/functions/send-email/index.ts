import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

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
        const { to, subject, html, fromName, attachments } = body

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

        console.log(`[send-email] Sending to: ${to}`)
        console.log(`[send-email] SMTP: ${smtpHost}:${smtpPort}`)
        
        if (attachments && attachments.length > 0) {
            console.log(`[send-email] Attachments: ${attachments.length}`)
        }

        // Use native fetch to call a working SMTP service or use nodemailer
        // Since denomailer has compatibility issues, let's use a simpler approach
        // We'll use the native SMTP protocol with proper STARTTLS support
        
        // For now, let's use port 465 (SSL/TLS) which works reliably
        const nodemailer = await import('npm:nodemailer@6.9.7')
        
        const transporter = nodemailer.default.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        })

        // Prepare email
        const emailConfig: any = {
            from: `${smtpFromName} <${smtpFromEmail}>`,
            to: to,
            subject: subject,
            html: html,
        }

        // Add attachments if provided
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
            emailConfig.attachments = attachments.map((att: any) => ({
                filename: att.filename,
                content: att.content,
                encoding: 'base64',
                contentType: att.contentType || 'application/pdf'
            }))
        }

        await transporter.sendMail(emailConfig)
        
        console.log('[send-email] Email sent successfully')

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error('[send-email] SMTP Error:', error.message)
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack,
            message: "Failed to send email. Check SMTP configuration."
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
