import { createClient } from "npm:@supabase/supabase-js@^2.39.0"
import { jsPDF } from "npm:jspdf@^2.5.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Edge Function: Export Enrollment Data
 * 
 * Exporta dados completos de matrícula incluindo:
 * - Nome do aluno
 * - Data de matrícula
 * - Informações de pagamento
 * - Aceite dos termos gerais
 * - Aceite dos termos específicos do programa (se houver)
 */
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing authorization header')

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) throw new Error('Unauthorized')

        // Verificar se é admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            throw new Error('Only admins can export enrollment data')
        }

        const { enrollment_id, format = 'pdf' } = await req.json()

        if (!enrollment_id) {
            throw new Error('Missing required parameter: enrollment_id')
        }

        // Buscar dados completos do enrollment
        const { data: enrollment, error: enrollError } = await supabase
            .from('program_enrollments')
            .select(`
                *,
                program:program_id (
                    title_pt,
                    title_en,
                    price_usd,
                    terms_content_pt,
                    terms_content_en
                ),
                user:user_id (
                    nome,
                    email
                )
            `)
            .eq('id', enrollment_id)
            .single()

        if (enrollError || !enrollment) throw new Error('Enrollment not found')

        // Buscar apenas os termos que o usuário ACEITOU (não todos os ativos)
        const { data: acceptedTerms } = await supabase
            .from('comprehensive_term_acceptance')
            .select(`
                *,
                term:term_id (
                    id,
                    title,
                    content,
                    term_type,
                    version
                )
            `)
            .eq('user_id', enrollment.user_id)
            .order('accepted_at', { ascending: false })

        // Mapear termos aceitos para o formato esperado
        const generalTerms = (acceptedTerms || []).map(acceptance => ({
            term: acceptance.term,
            accepted_at: acceptance.accepted_at,
            ip_address: acceptance.ip_address,
            accepted: true
        }))

        // Verificar se há termos específicos do programa
        const hasProgramTerms = !!(enrollment.program.terms_content_pt || enrollment.program.terms_content_en)
        
        let programTermsAcceptance = null
        if (hasProgramTerms) {
            programTermsAcceptance = {
                accepted: enrollment.terms_accepted,
                accepted_at: enrollment.terms_accepted_at,
                ip: enrollment.terms_ip || 'N/A',
                user_agent: enrollment.terms_user_agent || 'N/A'
            }
        }

        // Gerar documento baseado no formato
        if (format === 'pdf') {
            const pdfData = generatePDF(enrollment, generalTerms, programTermsAcceptance)
            return new Response(
                JSON.stringify({
                    success: true,
                    pdf: pdfData.pdf,
                    filename: pdfData.filename
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200
                }
            )
        } else if (format === 'csv') {
            const csvData = generateCSV(enrollment, generalTerms, programTermsAcceptance)
            return new Response(
                JSON.stringify({
                    success: true,
                    csv: csvData.csv,
                    filename: csvData.filename
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200
                }
            )
        } else {
            throw new Error('Invalid format. Use: pdf or csv')
        }

    } catch (error: any) {
        console.error('Export error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})

function generatePDF(enrollment: any, generalTerms: any[], programTermsAcceptance: any) {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = 20

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('COMPLETE ENROLLMENT DATA', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('323 Network - Community Platform', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Student Information
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('STUDENT INFORMATION', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${enrollment.user.nome}`, margin, yPosition)
    yPosition += 7
    doc.text(`Email: ${enrollment.user.email}`, margin, yPosition)
    yPosition += 7
    doc.text(`User ID: ${enrollment.user_id}`, margin, yPosition)
    yPosition += 15

    // Program Information
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('ENROLLED PROGRAM', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Program: ${enrollment.program.title_en || enrollment.program.title_pt}`, margin, yPosition)
    yPosition += 7
    
    const enrollDate = enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'long'
    }) : 'N/A'
    doc.text(`Enrollment Date: ${enrollDate}`, margin, yPosition)
    yPosition += 7
    doc.text(`Status: ${enrollment.status.toUpperCase()}`, margin, yPosition)
    yPosition += 15

    // Payment Information
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('PAYMENT INFORMATION', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    // Stripe amounts are in cents
    const amountInCents = enrollment.payment_amount || enrollment.program.price_usd * 100
    const amountInDollars = amountInCents / 100
    const currency = enrollment.payment_currency || 'USD'
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amountInDollars)
    
    doc.text(`Amount: ${formattedAmount}`, margin, yPosition)
    yPosition += 7
    doc.text(`Payment Status: ${enrollment.payment_status.toUpperCase()}`, margin, yPosition)
    yPosition += 7
    doc.text(`Payment ID (Stripe): ${enrollment.payment_id || 'N/A'}`, margin, yPosition)
    yPosition += 7
    
    const paymentMethod = enrollment.payment_method === 'card' ? 'Credit Card' : 
                         enrollment.payment_method === 'pix' ? 'PIX' : 
                         enrollment.payment_method || 'N/A'
    doc.text(`Payment Method: ${paymentMethod}`, margin, yPosition)
    yPosition += 7
    
    if (enrollment.paid_at) {
        const paidDate = new Date(enrollment.paid_at).toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'long'
        })
        doc.text(`Payment Date: ${paidDate}`, margin, yPosition)
        yPosition += 7
    }
    yPosition += 10

    // System Terms Acceptance
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SYSTEM TERMS ACCEPTANCE', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    if (generalTerms && generalTerms.length > 0) {
        generalTerms.forEach((termData, index) => {
            const { term, accepted_at, ip_address } = termData
            const termTypeLabel = term.term_type === 'terms_of_service' ? 'Terms of Service' : 'Privacy Policy'
            
            // Check if we need a new page
            if (yPosition > 240) {
                doc.addPage()
                yPosition = 20
            }
            
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.text(`${index + 1}. ${termTypeLabel} (v${term.version}) - ${term.title}`, margin, yPosition)
            yPosition += 6
            
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            const acceptDate = new Date(accepted_at).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'long'
            })
            doc.text(`   Accepted on: ${acceptDate}`, margin, yPosition)
            yPosition += 5
            doc.text(`   IP Address: ${ip_address || 'N/A'}`, margin, yPosition)
            yPosition += 8
            
            // Add term content with HTML parsing
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.text('   Content accepted:', margin, yPosition)
            yPosition += 6
            
            // Parse and render HTML content
            const content = term.content || 'Content not available'
            
            // Simple HTML parser for PDF
            const parseHTML = (html: string) => {
                // Remove script and style tags
                html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                
                // Split by tags while preserving them
                const parts = html.split(/(<[^>]+>)/)
                
                let currentFont: 'normal' | 'bold' = 'normal'
                let currentSize = 8
                let inList = false
                let listIndent = 0
                
                parts.forEach(part => {
                    if (!part.trim()) return
                    
                    // Handle opening tags
                    if (part.startsWith('<') && !part.startsWith('</')) {
                        const tag = part.match(/<(\w+)/)?.[1]?.toLowerCase()
                        
                        if (tag === 'h1') {
                            currentFont = 'bold'
                            currentSize = 12
                            yPosition += 4
                        } else if (tag === 'h2') {
                            currentFont = 'bold'
                            currentSize = 10
                            yPosition += 3
                        } else if (tag === 'h3') {
                            currentFont = 'bold'
                            currentSize = 9
                            yPosition += 2
                        } else if (tag === 'strong' || tag === 'b') {
                            currentFont = 'bold'
                        } else if (tag === 'ul' || tag === 'ol') {
                            inList = true
                            listIndent = 8
                            yPosition += 2
                        } else if (tag === 'li') {
                            if (yPosition > 270) {
                                doc.addPage()
                                yPosition = 20
                            }
                            doc.setFont('helvetica', 'normal')
                            doc.setFontSize(8)
                            doc.text('•', margin + 6 + listIndent, yPosition)
                        } else if (tag === 'p') {
                            yPosition += 2
                        } else if (tag === 'hr') {
                            yPosition += 2
                            doc.setDrawColor(200, 200, 200)
                            doc.line(margin + 3, yPosition, pageWidth - margin, yPosition)
                            yPosition += 2
                        } else if (tag === 'br') {
                            yPosition += 4
                        }
                    }
                    // Handle closing tags
                    else if (part.startsWith('</')) {
                        const tag = part.match(/<\/(\w+)/)?.[1]?.toLowerCase()
                        
                        if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
                            currentFont = 'normal'
                            currentSize = 8
                            yPosition += 3
                        } else if (tag === 'strong' || tag === 'b') {
                            currentFont = 'normal'
                        } else if (tag === 'ul' || tag === 'ol') {
                            inList = false
                            listIndent = 0
                            yPosition += 2
                        } else if (tag === 'li') {
                            yPosition += 4
                        } else if (tag === 'p') {
                            yPosition += 3
                        }
                    }
                    // Handle text content
                    else {
                        const text = part
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&amp;/g, '&')
                            .replace(/&quot;/g, '"')
                            .trim()
                        
                        if (text) {
                            doc.setFont('helvetica', currentFont)
                            doc.setFontSize(currentSize)
                            
                            const textIndent = inList ? listIndent + 10 : 3
                            const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - textIndent - 3)
                            
                            lines.forEach((line: string, lineIndex: number) => {
                                if (yPosition > 270) {
                                    doc.addPage()
                                    yPosition = 20
                                }
                                const xPos = margin + textIndent + (lineIndex > 0 && inList ? 0 : 0)
                                doc.text(line, xPos, yPosition)
                                yPosition += currentSize * 0.5
                            })
                        }
                    }
                })
            }
            
            parseHTML(content)
            
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            yPosition += 10
        })
    } else {
        doc.text('No system terms acceptance recorded for this user.', margin, yPosition)
        yPosition += 10
    }

    // Program-Specific Terms Acceptance
    if (programTermsAcceptance) {
        // Add new page if necessary
        if (yPosition > 240) {
            doc.addPage()
            yPosition = 20
        } else {
            yPosition += 5
        }

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('PROGRAM-SPECIFIC TERMS ACCEPTANCE', margin, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        if (programTermsAcceptance.accepted) {
            doc.setFont('helvetica', 'bold')
            doc.text(`✓ Program-Specific Terms`, margin, yPosition)
            yPosition += 6
            
            doc.setFont('helvetica', 'normal')
            const acceptDate = new Date(programTermsAcceptance.accepted_at).toLocaleString('en-US')
            doc.text(`  Accepted on: ${acceptDate}`, margin + 5, yPosition)
            yPosition += 6
            doc.text(`  IP: ${programTermsAcceptance.ip}`, margin + 5, yPosition)
            yPosition += 6
            const userAgentLines = doc.splitTextToSize(`  Browser: ${programTermsAcceptance.user_agent}`, pageWidth - 2 * margin - 10)
            doc.text(userAgentLines, margin + 5, yPosition)
            yPosition += 6 * userAgentLines.length
        } else {
            doc.text('The program has specific terms that have not been accepted by this student yet.', margin, yPosition)
            yPosition += 10
        }
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    const footerY = doc.internal.pageSize.getHeight() - 20
    doc.text('This document serves as proof of enrollment and terms acceptance.', pageWidth / 2, footerY - 5, { align: 'center' })
    doc.text('323 Network - Community Platform', pageWidth / 2, footerY, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleString('en-US')} (UTC)`, pageWidth / 2, footerY + 5, { align: 'center' })
    doc.text(`Enrollment ID: ${enrollment.id}`, pageWidth / 2, footerY + 10, { align: 'center' })

    // Convert to base64
    const pdfBase64 = doc.output('datauristring').split(',')[1]
    const filename = `enrollment_${enrollment.user.nome.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

    return { pdf: pdfBase64, filename }
}

function generateCSV(enrollment: any, generalTerms: any[], programTermsAcceptance: any) {
    const rows = []
    
    // Header
    rows.push(['Campo', 'Valor'])
    rows.push([])
    
    // Informações do Aluno
    rows.push(['=== INFORMAÇÕES DO ALUNO ===', ''])
    rows.push(['Nome', enrollment.user.nome])
    rows.push(['Email', enrollment.user.email])
    rows.push(['ID do Usuário', enrollment.user_id])
    rows.push([])
    
    // Informações do Programa
    rows.push(['=== PROGRAMA MATRICULADO ===', ''])
    rows.push(['Programa', enrollment.program.title_pt])
    rows.push(['Data de Matrícula', enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString('pt-BR') : 'N/A'])
    rows.push(['Status', enrollment.status.toUpperCase()])
    rows.push([])
    
    // Informações de Pagamento
    rows.push(['=== INFORMAÇÕES DE PAGAMENTO ===', ''])
    const amountInCents = enrollment.payment_amount || enrollment.program.price_usd * 100
    const amountInDollars = amountInCents / 100
    const currency = enrollment.payment_currency || 'USD'
    rows.push(['Valor', `${currency} ${amountInDollars}`])
    rows.push(['Status do Pagamento', enrollment.payment_status.toUpperCase()])
    rows.push(['Payment ID (Stripe)', enrollment.payment_id || 'N/A'])
    
    const paymentMethod = enrollment.payment_method === 'card' ? 'Cartão de Crédito' : 
                         enrollment.payment_method === 'pix' ? 'PIX' : 
                         enrollment.payment_method || 'N/A'
    rows.push(['Método de Pagamento', paymentMethod])
    
    if (enrollment.paid_at) {
        rows.push(['Data do Pagamento', new Date(enrollment.paid_at).toLocaleString('pt-BR')])
    }
    rows.push([])
    
    // System Terms Acceptance
    rows.push(['=== SYSTEM TERMS ACCEPTANCE ===', ''])
    if (generalTerms && generalTerms.length > 0) {
        generalTerms.forEach((termData) => {
            const { term, accepted_at, ip_address } = termData
            const termTypeLabel = term.term_type === 'terms_of_service' ? 'Terms of Service' : 'Privacy Policy'
            rows.push([termTypeLabel, `Version ${term.version}`])
            rows.push(['  Accepted on', new Date(accepted_at).toLocaleString('en-US')])
            rows.push(['  IP', ip_address || 'N/A'])
        })
    } else {
        rows.push(['Status', 'No system terms acceptance recorded for this user'])
    }
    rows.push([])
    
    // Aceite de Termos Específicos do Programa
    if (programTermsAcceptance) {
        rows.push(['=== ACEITE DE TERMOS ESPECÍFICOS DO PROGRAMA ===', ''])
        if (programTermsAcceptance.accepted) {
            rows.push(['Status', 'Aceito'])
            rows.push(['Aceito em', new Date(programTermsAcceptance.accepted_at).toLocaleString('pt-BR')])
            rows.push(['IP', programTermsAcceptance.ip])
            rows.push(['Navegador', programTermsAcceptance.user_agent])
        } else {
            rows.push(['Status', 'Não aceito'])
        }
    }
    
    // Converter para CSV
    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const csvBase64 = btoa(unescape(encodeURIComponent(csvContent)))
    const filename = `matricula_${enrollment.user.nome.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    
    return { csv: csvBase64, filename }
}
