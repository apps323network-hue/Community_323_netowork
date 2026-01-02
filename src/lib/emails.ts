import { supabase } from './supabase'

// Interface para admin
interface Admin {
  id: string
  nome: string
  email: string
}

// Função para buscar todos os admins e seus emails
export async function getAllAdmins(): Promise<Admin[]> {
  try {
    const { data, error } = await supabase.functions.invoke('get-admin-emails', {
      body: {},
    })

    if (error) {
      console.error('Error fetching admin emails:', error)
      return []
    }

    return data?.admins || []
  } catch (err: any) {
    console.error('Error in getAllAdmins:', err)
    return []
  }
}

export async function sendEmail(to: string, subject: string, html: string, fromName?: string) {
  try {
    // A função send-email não requer autenticação (conforme comentário no código)
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html, fromName },
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err: any) {
    console.error('Error in sendEmail:', err)
    return { success: false, error: err }
  }
}

export async function sendConnectionRequestEmail(toEmail: string, recipientName: string, requesterName: string) {
  const subject = `Nova solicitação de conexão - ${requesterName}`
  const logoUrl = 'https://pgdvbanwumqjmqeybqnw.supabase.co/storage/v1/object/public/avatars/logo/logo.png'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .email-container {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background-color: #0c0f16;
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          width: 130px;
          height: auto;
        }
        .content {
          padding: 50px 40px;
          color: #1e293b;
          line-height: 1.6;
        }
        .greeting {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #0f172a;
          text-align: center;
        }
        .message {
          font-size: 16px;
          margin-bottom: 32px;
          text-align: center;
          color: #475569;
        }
        .requester-box {
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 32px;
          text-align: center;
        }
        .button-container {
          text-align: center;
        }
        .button {
          display: inline-block;
          background-color: #f425f4;
          color: #ffffff !important;
          padding: 16px 48px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .footer {
          background-color: #ffffff;
          padding: 40px 20px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body style="background-color: #f8fafc; padding: 40px 0;">
      <div class="email-container">
        <div class="header">
          <img src="${logoUrl}" alt="323 Network" class="logo">
        </div>
        <div class="content">
          <h1 class="greeting">Olá, ${recipientName}</h1>
          <p class="message">
            Você recebeu uma nova solicitação para expandir sua rede profissional na 323 Network.
          </p>
          <div class="requester-box">
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 12px;">Solicitação de Conexão</div>
            <div style="font-size: 20px; color: #0f172a; font-weight: 600;">${requesterName}</div>
          </div>
          <div class="button-container">
            <a href="${window.location.origin}/conexoes" class="button">Ver Perfil</a>
          </div>
        </div>
        <div class="footer">
          323 Network<br>
          Building bridges, creating opportunities.
        </div>
      </div>
    </body>
    </html>
  `
  return sendEmail(toEmail, subject, html)
}

// Função para enviar email de contato de parceiros (sem autenticação necessária)
export async function sendPartnerContactEmail(formData: {
  name: string
  company: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  const subject = `Nova solicitação de parceria - ${formData.company}`
  const logoUrl = 'https://pgdvbanwumqjmqeybqnw.supabase.co/storage/v1/object/public/avatars/logo/logo.png'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .email-container {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background-color: #0c0f16;
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          width: 130px;
          height: auto;
        }
        .content {
          padding: 50px 40px;
          color: #1e293b;
          line-height: 1.6;
        }
        .greeting {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #0f172a;
          text-align: center;
        }
        .info-box {
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 32px;
        }
        .info-row {
          margin-bottom: 20px;
        }
        .info-row:last-child {
          margin-bottom: 0;
        }
        .info-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .info-value {
          font-size: 16px;
          color: #0f172a;
          font-weight: 500;
        }
        .message-box {
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 30px;
          margin-top: 24px;
        }
        .message-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .message-content {
          font-size: 15px;
          color: #1e293b;
          line-height: 1.7;
          white-space: pre-wrap;
        }
        .footer {
          background-color: #ffffff;
          padding: 40px 20px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body style="background-color: #f8fafc; padding: 40px 0;">
      <div class="email-container">
        <div class="header">
          <img src="${logoUrl}" alt="323 Network" class="logo">
        </div>
        <div class="content">
          <h1 class="greeting">Nova Solicitação de Parceria</h1>
          
          <div class="info-box">
            <div class="info-row">
              <div class="info-label">Nome</div>
              <div class="info-value">${formData.name}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Empresa</div>
              <div class="info-value">${formData.company}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Email</div>
              <div class="info-value">${formData.email}</div>
            </div>
            ${formData.phone ? `
            <div class="info-row">
              <div class="info-label">Telefone</div>
              <div class="info-value">${formData.phone}</div>
            </div>
            ` : ''}
            <div class="info-row">
              <div class="info-label">Assunto</div>
              <div class="info-value">${formData.subject}</div>
            </div>
          </div>

          <div class="message-box">
            <div class="message-label">Mensagem</div>
            <div class="message-content">${formData.message}</div>
          </div>
        </div>
        <div class="footer">
          323 Network<br>
          Building bridges, creating opportunities.
        </div>
      </div>
    </body>
    </html>
  `
  
  // Chamar a Edge Function (a função send-email não requer autenticação)
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { 
      to: 'admin@323network.com',
      subject,
      html,
      fromName: '323 Network - Parceiros'
    }
  })

  if (error) {
    console.error('Error sending partner contact email:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

// Template base para emails de notificação admin
function getEmailTemplateBase(title: string, content: string, actionUrl: string, actionText: string): string {
  const logoUrl = 'https://pgdvbanwumqjmqeybqnw.supabase.co/storage/v1/object/public/avatars/logo/logo.png'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://323network.com'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .email-container {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background-color: #0c0f16;
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          width: 130px;
          height: auto;
        }
        .content {
          padding: 50px 40px;
          color: #1e293b;
          line-height: 1.6;
        }
        .greeting {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #0f172a;
          text-align: center;
        }
        .message {
          font-size: 16px;
          margin-bottom: 32px;
          color: #475569;
        }
        .info-box {
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 32px;
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          background-color: #f425f4;
          color: #ffffff !important;
          padding: 16px 48px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .footer {
          background-color: #ffffff;
          padding: 40px 20px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body style="background-color: #f8fafc; padding: 40px 0;">
      <div class="email-container">
        <div class="header">
          <img src="${logoUrl}" alt="323 Network" class="logo">
        </div>
        <div class="content">
          <h1 class="greeting">${title}</h1>
          <div class="message">
            ${content}
          </div>
          <div class="button-container">
            <a href="${baseUrl}${actionUrl}" class="button">${actionText}</a>
          </div>
        </div>
        <div class="footer">
          323 Network<br>
          Building bridges, creating opportunities.
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para notificação de novo usuário
function getNewUserEmailTemplate(userName: string, userArea: string, createdAt: string): string {
  const title = 'Novo Usuário Pendente de Aprovação'
  const content = `
    <p>Um novo membro se cadastrou na 323 Network e está aguardando aprovação.</p>
    <div class="info-box">
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Nome</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${userName}</div>
      </div>
      ${userArea ? `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Área de Atuação</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${userArea}</div>
      </div>
      ` : ''}
      <div>
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Data de Cadastro</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${new Date(createdAt).toLocaleDateString('pt-BR')}</div>
      </div>
    </div>
    <p style="color: #64748b; font-size: 14px;">Acesse o dashboard para revisar e aprovar este membro.</p>
  `
  return getEmailTemplateBase(title, content, '/admin/membros?tab=pending', 'Revisar Membro')
}

// Template para notificação de novo post
function getNewPostEmailTemplate(postContent: string, authorName: string, postType: string): string {
  const title = 'Novo Post Pendente de Aprovação'
  const preview = postContent.length > 200 ? postContent.substring(0, 200) + '...' : postContent
  const typeLabels: Record<string, string> = {
    networking: 'Networking',
    ofereco_servico: 'Ofereço Serviço',
    procuro_ajuda: 'Procuro Ajuda',
    oportunidade: 'Oportunidade'
  }
  const content = `
    <p>Um novo post foi criado e está aguardando aprovação.</p>
    <div class="info-box">
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Autor</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${authorName}</div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Tipo</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${typeLabels[postType] || postType}</div>
      </div>
      <div>
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Preview</div>
        <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${preview}</div>
      </div>
    </div>
    <p style="color: #64748b; font-size: 14px;">Acesse o dashboard para revisar e aprovar este post.</p>
  `
  return getEmailTemplateBase(title, content, '/admin/posts?tab=pending', 'Revisar Post')
}

// Template para notificação de novo evento
function getNewEventEmailTemplate(eventTitle: string, eventDate: string, eventType: string, creatorName: string): string {
  const title = 'Novo Evento Pendente de Aprovação'
  const typeLabels: Record<string, string> = {
    presencial: 'Presencial',
    webinar: 'Webinar'
  }
  const content = `
    <p>Um novo evento foi criado e está aguardando aprovação.</p>
    <div class="info-box">
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Título</div>
        <div style="font-size: 18px; color: #0f172a; font-weight: 600;">${eventTitle}</div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Data e Hora</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${new Date(eventDate).toLocaleString('pt-BR')}</div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Tipo</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${typeLabels[eventType] || eventType}</div>
      </div>
      <div>
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Criador</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${creatorName}</div>
      </div>
    </div>
    <p style="color: #64748b; font-size: 14px;">Acesse o dashboard para revisar e aprovar este evento.</p>
  `
  return getEmailTemplateBase(title, content, '/admin/eventos?tab=pending', 'Revisar Evento')
}

// Template para notificação de novo report
function getNewReportEmailTemplate(reportType: string, reason: string, reporterName: string, description?: string): string {
  const title = 'Novo Report de Conteúdo'
  const typeLabels: Record<string, string> = {
    post: 'Post',
    comment: 'Comentário',
    user: 'Usuário'
  }
  const reasonLabels: Record<string, string> = {
    spam: 'Spam',
    inappropriate: 'Conteúdo Inapropriado',
    harassment: 'Assédio',
    fake_news: 'Fake News',
    other: 'Outro'
  }
  const content = `
    <p>Um novo report foi criado e precisa de análise.</p>
    <div class="info-box">
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Tipo de Conteúdo</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${typeLabels[reportType] || reportType}</div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Motivo</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${reasonLabels[reason] || reason}</div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Reportado por</div>
        <div style="font-size: 16px; color: #0f172a; font-weight: 500;">${reporterName}</div>
      </div>
      ${description ? `
      <div>
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">Descrição</div>
        <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${description}</div>
      </div>
      ` : ''}
    </div>
    <p style="color: #64748b; font-size: 14px;">Acesse o dashboard para analisar este report.</p>
  `
  return getEmailTemplateBase(title, content, '/admin/reports?tab=pending', 'Analisar Report')
}

// Função para notificar admins sobre novo usuário
export async function notifyAdminsNewUser(userId: string, userName: string, userArea?: string, createdAt?: string) {
  try {
    const admins = await getAllAdmins()
    if (admins.length === 0) {
      console.log('No admins found to notify')
      return
    }

    const html = getNewUserEmailTemplate(userName, userArea || '', createdAt || new Date().toISOString())
    const subject = `Novo Usuário Pendente: ${userName}`
    
    // Enviar emails em paralelo para todos os admins
    const emailPromises = admins.map(admin => 
      sendEmail(admin.email, subject, html, '323 Network - Admin')
    )

    const results = await Promise.allSettled(emailPromises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    console.log(`Notified ${successCount}/${admins.length} admins about new user ${userId}`)
  } catch (error) {
    console.error('Error notifying admins about new user:', error)
    // Não lançar erro para não bloquear criação do usuário
  }
}

// Função para notificar admins sobre novo post
export async function notifyAdminsNewPost(postId: string, postContent: string, authorName: string, postType: string) {
  try {
    const admins = await getAllAdmins()
    if (admins.length === 0) {
      console.log('No admins found to notify')
      return
    }

    const html = getNewPostEmailTemplate(postContent, authorName, postType)
    const subject = `Novo Post Pendente: ${authorName}`
    
    const emailPromises = admins.map(admin => 
      sendEmail(admin.email, subject, html, '323 Network - Admin')
    )

    const results = await Promise.allSettled(emailPromises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    console.log(`Notified ${successCount}/${admins.length} admins about new post ${postId}`)
  } catch (error) {
    console.error('Error notifying admins about new post:', error)
    // Não lançar erro para não bloquear criação do post
  }
}

// Função para notificar admins sobre novo evento
export async function notifyAdminsNewEvent(eventId: string, eventTitle: string, eventDate: string, eventType: string, creatorName: string) {
  try {
    const admins = await getAllAdmins()
    if (admins.length === 0) {
      console.log('No admins found to notify')
      return
    }

    const html = getNewEventEmailTemplate(eventTitle, eventDate, eventType, creatorName)
    const subject = `Novo Evento Pendente: ${eventTitle}`
    
    const emailPromises = admins.map(admin => 
      sendEmail(admin.email, subject, html, '323 Network - Admin')
    )

    const results = await Promise.allSettled(emailPromises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    console.log(`Notified ${successCount}/${admins.length} admins about new event ${eventId}`)
  } catch (error) {
    console.error('Error notifying admins about new event:', error)
    // Não lançar erro para não bloquear criação do evento
  }
}

// Função para notificar admins sobre novo report
export async function notifyAdminsNewReport(reportId: string, reportType: string, reason: string, reporterName: string, description?: string) {
  try {
    const admins = await getAllAdmins()
    if (admins.length === 0) {
      console.log('No admins found to notify')
      return
    }

    const html = getNewReportEmailTemplate(reportType, reason, reporterName, description)
    const subject = `Novo Report: ${reportType} - ${reason}`
    
    const emailPromises = admins.map(admin => 
      sendEmail(admin.email, subject, html, '323 Network - Admin')
    )

    const results = await Promise.allSettled(emailPromises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    console.log(`Notified ${successCount}/${admins.length} admins about new report ${reportId}`)
  } catch (error) {
    console.error('Error notifying admins about new report:', error)
    // Não lançar erro para não bloquear criação do report
  }
}