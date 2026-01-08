import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { enrollment_id, program_id, user_id } = await req.json()

    console.log('Processing enrollment notification:', { enrollment_id, program_id, user_id })

    // SMTP Configuration from Environment Variables
    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpPortStr = Deno.env.get('SMTP_PORT')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')
    const smtpFromEmail = Deno.env.get('SMTP_FROM_EMAIL') || smtpUser
    const smtpFromName = Deno.env.get('SMTP_FROM_NAME') || '323 Network'

    if (!smtpHost || !smtpPortStr || !smtpUser || !smtpPass) {
      throw new Error('SMTP environment variables not configured')
    }

    const smtpPort = Number(smtpPortStr)
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Buscar dados do aluno
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, nome, email')
      .eq('id', user_id)
      .single()

    if (studentError) {
      console.error('Error fetching student:', studentError)
      throw studentError
    }

    // 2. Buscar dados do programa
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('id, title_pt, title_en')
      .eq('id', program_id)
      .single()

    if (programError) {
      console.error('Error fetching program:', programError)
      throw programError
    }

    // 3. Buscar professores vinculados ao programa
    const { data: assignments, error: professorsError } = await supabase
      .from('program_professors')
      .select(`
                professor_id,
                professor:profiles!program_professors_professor_id_fkey(
                    id,
                    nome,
                    email
                )
            `)
      .eq('program_id', program_id)

    if (professorsError) {
      console.error('Error fetching professors:', professorsError)
      throw professorsError
    }

    if (!assignments || assignments.length === 0) {
      console.warn('No professors assigned to program:', program_id)
      return new Response(
        JSON.stringify({ success: true, message: 'No professors to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailResults = []
    const smtpClient = new SmtpClient()

    // Connect to SMTP once
    await smtpClient.connect({
      hostname: smtpHost,
      port: smtpPort,
      username: smtpUser,
      password: smtpPass,
    })

    // 4. Enviar email para cada professor
    for (const assignment of assignments) {
      const professor = assignment.professor

      if (!professor || !professor.email) {
        console.warn('Professor without email:', assignment.professor_id)
        continue
      }

      try {
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <!-- Header com gradiente -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #FFD600; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">
                          Novo Aluno! 🎉
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Conteúdo -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 24px; font-size: 18px; color: #1a1a1a; font-weight: 600;">
                          Olá, ${professor.nome || 'Professor'}!
                        </p>
                        
                        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                          Você tem um novo aluno matriculado no programa <strong style="color: #1a1a1a;">${program.title_pt}</strong>.
                        </p>
                        
                        <!-- Card do aluno -->
                        <div style="background-color: #f8f8f8; border-left: 4px solid #FFD600; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                          <h3 style="margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #666; font-weight: 900;">
                            Dados do Aluno
                          </h3>
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0; font-size: 14px; color: #666; font-weight: 600;">Nome:</td>
                              <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; font-weight: 600;">${student.nome || 'Nome não disponível'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; font-size: 14px; color: #666; font-weight: 600;">Email:</td>
                              <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; font-weight: 600;">${student.email || 'Email não disponível'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; font-size: 14px; color: #666; font-weight: 600;">Data de Matrícula:</td>
                              <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; font-weight: 600;">${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                            </tr>
                          </table>
                        </div>
                        
                        <!-- CTA Button -->
                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center">
                              <a href="https://323network.com/professor/programa/${program_id}?tab=students" 
                                 style="display: inline-block; background-color: #FFD600; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(255, 214, 0, 0.3);">
                                Ver Todos os Alunos →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f8f8; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
                        <p style="margin: 0 0 8px; font-size: 12px; color: #999; font-weight: 600;">
                          Plataforma 323 Network
                        </p>
                        <p style="margin: 0; font-size: 11px; color: #999;">
                          Este é um email automático. Por favor, não responda.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `

        await smtpClient.send({
          from: `"${smtpFromName}" <${smtpFromEmail}>`,
          to: professor.email,
          subject: `✨ Novo aluno matriculado: ${program.title_pt}`,
          content: html,
          html: html,
        })

        console.log('Email sent successfully to:', professor.email)
        emailResults.push({
          professor_id: professor.id,
          success: true
        })
      } catch (emailError) {
        console.error('Error sending email to professor:', professor.id, emailError)
        emailResults.push({
          professor_id: professor.id,
          success: false,
          error: String(emailError)
        })
      }
    }

    await smtpClient.close()

    return new Response(
      JSON.stringify({
        success: true,
        emails_sent: emailResults.filter(r => r.success).length,
        total_professors: assignments.length,
        results: emailResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in notify-professor-enrollment:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
