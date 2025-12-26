import { supabase } from './supabase'

export async function sendEmail(to: string, subject: string, html: string, fromName?: string) {
    const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html, fromName }
    })

    if (error) {
        console.error('Error sending email:', error)
        return { success: false, error }
    }

    return { success: true, data }
}

export async function sendConnectionRequestEmail(toEmail: string, recipientName: string, requesterName: string) {
    const subject = `Nova solicitação de conexão - ${requesterName}`
    const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h2>Olá, ${recipientName}!</h2>
      <p><strong>${requesterName}</strong> enviou uma solicitação de conexão para você na 323 Network.</p>
      <p>Acesse a plataforma para aceitar ou recusar a solicitação.</p>
      <br />
      <a href="${window.location.origin}/perfil" style="background-color: #f425f4; color: white; padding: 10px 20px; text-decoration: none; rounded: 5px;">Ver Perfil</a>
    </div>
  `
    return sendEmail(toEmail, subject, html)
}
