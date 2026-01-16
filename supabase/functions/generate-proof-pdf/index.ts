import { createClient } from "npm:@supabase/supabase-js@^2.39.0"
import { jsPDF } from "npm:jspdf@^2.5.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Edge Function: Generate Proof PDF
 * 
 * Gera PDFs de comprovação para:
 * - Assinatura de Termos de Serviço
 * - Assinatura de Política de Privacidade
 * - Comprovante de Pagamento de Programas
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

        const { type, id } = await req.json()

        if (!type || !id) {
            throw new Error('Missing required parameters: type and id')
        }

        let pdfData: any = null

        switch (type) {
            case 'term_acceptance':
                pdfData = await generateTermAcceptancePDF(supabase, id, user.id)
                break
            case 'payment_proof':
                pdfData = await generatePaymentProofPDF(supabase, id, user.id)
                break
            default:
                throw new Error('Invalid type. Use: term_acceptance or payment_proof')
        }

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

    } catch (error: any) {
        console.error('PDF generation error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})

async function generateTermAcceptancePDF(supabase: any, acceptanceId: string, userId: string) {
    // Buscar dados da aceitação
    const { data: acceptance, error } = await supabase
        .from('term_acceptances')
        .select(`
            *,
            term:term_id (
                title,
                type,
                version,
                content_pt,
                content_en
            ),
            user:user_id (
                nome,
                email
            )
        `)
        .eq('id', acceptanceId)
        .single()

    if (error || !acceptance) throw new Error('Term acceptance not found')

    // Verificar se o usuário tem permissão (admin ou próprio usuário)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    const isAdmin = profile?.role === 'admin'
    const isOwner = acceptance.user_id === userId

    if (!isAdmin && !isOwner) {
        throw new Error('You do not have permission to access this document')
    }

    // Criar PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = 20

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('COMPROVANTE DE ASSINATURA', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('323 Network - Community Platform', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Informações do Documento
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMAÇÕES DO DOCUMENTO', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const termType = acceptance.term.type === 'terms_of_service' ? 'Termos de Serviço' : 'Política de Privacidade'
    doc.text(`Tipo: ${termType}`, margin, yPosition)
    yPosition += 7
    doc.text(`Título: ${acceptance.term.title}`, margin, yPosition)
    yPosition += 7
    doc.text(`Versão: ${acceptance.term.version}`, margin, yPosition)
    yPosition += 7
    doc.text(`ID do Documento: ${acceptanceId}`, margin, yPosition)
    yPosition += 15

    // Informações do Usuário
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DADOS DO USUÁRIO', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nome: ${acceptance.user.nome}`, margin, yPosition)
    yPosition += 7
    doc.text(`Email: ${acceptance.user.email}`, margin, yPosition)
    yPosition += 7
    doc.text(`ID do Usuário: ${acceptance.user_id}`, margin, yPosition)
    yPosition += 15

    // Informações da Aceitação
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DETALHES DA ASSINATURA', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const acceptedDate = new Date(acceptance.accepted_at).toLocaleString('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'long'
    })
    doc.text(`Data e Hora: ${acceptedDate}`, margin, yPosition)
    yPosition += 7
    doc.text(`Endereço IP: ${acceptance.ip_address || 'Não registrado'}`, margin, yPosition)
    yPosition += 7
    
    if (acceptance.user_agent) {
        const userAgent = doc.splitTextToSize(`Navegador: ${acceptance.user_agent}`, pageWidth - 2 * margin)
        doc.text(userAgent, margin, yPosition)
        yPosition += 7 * userAgent.length
    }
    
    yPosition += 10

    // Hash de Verificação
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('VERIFICAÇÃO DE AUTENTICIDADE', margin, yPosition)
    yPosition += 10

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const verificationHash = `${acceptanceId}-${acceptance.user_id}-${acceptance.accepted_at}`
    const hashText = doc.splitTextToSize(`Hash: ${btoa(verificationHash)}`, pageWidth - 2 * margin)
    doc.text(hashText, margin, yPosition)
    yPosition += 5 * hashText.length + 10

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    const footerY = doc.internal.pageSize.getHeight() - 20
    doc.text('Este documento foi gerado eletronicamente pela 323 Network', pageWidth / 2, footerY, { align: 'center' })
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, footerY + 5, { align: 'center' })
    doc.text('Para verificar a autenticidade, entre em contato com suporte@323network.com', pageWidth / 2, footerY + 10, { align: 'center' })

    // Converter para base64
    const pdfBase64 = doc.output('datauristring').split(',')[1]
    const filename = `assinatura_${termType.toLowerCase().replace(/\s/g, '_')}_${acceptance.user.nome.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

    return { pdf: pdfBase64, filename }
}

async function generatePaymentProofPDF(supabase: any, enrollmentId: string, userId: string) {
    // Buscar dados do enrollment e pagamento
    const { data: enrollment, error } = await supabase
        .from('program_enrollments')
        .select(`
            *,
            program:program_id (
                title_pt,
                title_en,
                price_usd
            ),
            user:user_id (
                nome,
                email
            )
        `)
        .eq('id', enrollmentId)
        .single()

    if (error || !enrollment) throw new Error('Enrollment not found')

    // Verificar permissão
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    const isAdmin = profile?.role === 'admin'
    const isOwner = enrollment.user_id === userId

    if (!isAdmin && !isOwner) {
        throw new Error('You do not have permission to access this document')
    }

    // Verificar se o pagamento foi realizado
    if (enrollment.payment_status !== 'paid') {
        throw new Error('Payment has not been confirmed yet')
    }

    // Criar PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = 20

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('COMPROVANTE DE PAGAMENTO', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('323 Network - Community Platform', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Informações do Pagamento
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DADOS DO PAGAMENTO', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`ID da Transação: ${enrollmentId}`, margin, yPosition)
    yPosition += 7
    doc.text(`ID Stripe: ${enrollment.payment_id || 'N/A'}`, margin, yPosition)
    yPosition += 7
    
    const paidDate = enrollment.paid_at 
        ? new Date(enrollment.paid_at).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'long' })
        : 'Data não registrada'
    doc.text(`Data do Pagamento: ${paidDate}`, margin, yPosition)
    yPosition += 7
    
    const paymentMethod = enrollment.payment_method === 'card' ? 'Cartão de Crédito' : 
                         enrollment.payment_method === 'pix' ? 'PIX' : 
                         enrollment.payment_method || 'Não especificado'
    doc.text(`Método de Pagamento: ${paymentMethod}`, margin, yPosition)
    yPosition += 7
    doc.text(`Status: ${enrollment.payment_status.toUpperCase()}`, margin, yPosition)
    yPosition += 15

    // Informações do Programa
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('PROGRAMA ADQUIRIDO', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Programa: ${enrollment.program.title_pt}`, margin, yPosition)
    yPosition += 15

    // Informações do Cliente
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DADOS DO CLIENTE', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nome: ${enrollment.user.nome}`, margin, yPosition)
    yPosition += 7
    doc.text(`Email: ${enrollment.user.email}`, margin, yPosition)
    yPosition += 15

    // Valores
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('VALORES', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const amount = enrollment.payment_amount || enrollment.program.price_usd
    const currency = enrollment.payment_currency || 'USD'
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
    }).format(amount)
    
    doc.text(`Valor Pago: ${formattedAmount}`, margin, yPosition)
    yPosition += 15

    // Hash de Verificação
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('VERIFICAÇÃO DE AUTENTICIDADE', margin, yPosition)
    yPosition += 10

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const verificationHash = `${enrollmentId}-${enrollment.user_id}-${enrollment.paid_at}`
    const hashText = doc.splitTextToSize(`Hash: ${btoa(verificationHash)}`, pageWidth - 2 * margin)
    doc.text(hashText, margin, yPosition)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    const footerY = doc.internal.pageSize.getHeight() - 20
    doc.text('Este documento foi gerado eletronicamente pela 323 Network', pageWidth / 2, footerY, { align: 'center' })
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, footerY + 5, { align: 'center' })
    doc.text('Para verificar a autenticidade, entre em contato com suporte@323network.com', pageWidth / 2, footerY + 10, { align: 'center' })

    // Converter para base64
    const pdfBase64 = doc.output('datauristring').split(',')[1]
    const filename = `comprovante_pagamento_${enrollment.user.nome.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

    return { pdf: pdfBase64, filename }
}
