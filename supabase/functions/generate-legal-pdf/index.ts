import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@^2.39.0'
import { jsPDF } from 'npm:jspdf@^2.5.1'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const body = await req.json()
        const { type, acceptance_id, user_id, term_id, enrollment_id } = body

        console.log('[generate-legal-pdf] Request:', { type, acceptance_id, user_id, term_id, enrollment_id })

        // Adding a small delay (1s) to ensure records are fully committed in the database
        // before we query them for the bundle PDF.
        if (type === 'terms_acceptance') {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        let pdfData: { pdf: string; filename: string }
        let relatedId: string

        if (type === 'terms_acceptance') {
            // Generate terms acceptance PDF
            const result = await generateTermsAcceptancePDF(supabase, acceptance_id, user_id, term_id)
            pdfData = result.pdfData
            relatedId = acceptance_id
        } else if (type === 'enrollment_contract') {
            // Generate enrollment contract PDF
            console.log('[generate-legal-pdf] 📄 Generating enrollment contract for:', enrollment_id)
            
            if (!enrollment_id) {
                throw new Error('enrollment_id is required for enrollment_contract type')
            }
            
            try {
                const result = await generateEnrollmentContractPDF(supabase, enrollment_id)
                pdfData = result.pdfData
                relatedId = enrollment_id
                console.log('[generate-legal-pdf] ✅ Enrollment contract generated successfully')
            } catch (err: any) {
                console.error('[generate-legal-pdf] 🚨 Error generating enrollment contract:', err.message)
                console.error('[generate-legal-pdf] 🚨 Stack:', err.stack)
                throw err
            }
        } else {
            throw new Error('Invalid type. Use: terms_acceptance or enrollment_contract')
        }

        // Upload PDF to storage
        const storagePath = await uploadToStorage(supabase, pdfData, user_id, type)

        // Track in database
        const { error: trackError } = await supabase
            .from('legal_documents')
            .insert({
                document_type: type,
                user_id,
                related_id: relatedId,
                storage_path: storagePath,
                filename: pdfData.filename
            })

        if (trackError) {
            console.error('[generate-legal-pdf] Error tracking document:', trackError)
        }

        // Send email with PDF attachment
       await sendEmailWithAttachment(supabase, pdfData, user_id, type)

        return new Response(JSON.stringify({
            success: true,
            storage_path: storagePath,
            filename: pdfData.filename
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })
    } catch (error: any) {
        console.error('[generate-legal-pdf] Error:', error)
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        })
    }
})

async function generateTermsAcceptancePDF(
    supabase: any,
    acceptanceId: string,
    userId: string,
    termId: string
): Promise<{ pdfData: { pdf: string; filename: string } }> {
    // Fetch term acceptance data
    // Fetch the latest acceptance for EACH type for this user
    // This is more reliable than a time window
    const { data: acceptances, error: acceptError } = await supabase
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
        .eq('user_id', userId)
        .order('accepted_at', { ascending: false })
        .limit(20)

    if (acceptError || !acceptances || acceptances.length === 0) throw new Error('Term acceptances not found')

    // Find the latest for each type
    const tos = acceptances.find((a: any) => a.term.term_type === 'terms_of_service')
    const privacy = acceptances.find((a: any) => a.term.term_type === 'privacy_policy')
    
    const relevantAcceptances = [tos, privacy].filter(Boolean)
    const primaryAcceptance = acceptances.find((a: any) => a.id === acceptanceId) || relevantAcceptances[0]

    console.log(`[generate-legal-pdf] Found ${relevantAcceptances.length} relevant documents for bundle.`)

    // Fetch user data
    const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('nome, email')
        .eq('id', userId)
        .single()

    if (userError || !user) throw new Error('User not found')

    // Generate PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = 20

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('TERMS ACCEPTANCE CERTIFICATE', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('323 Network - Community Platform', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // User Information
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('USER INFORMATION', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${user.nome}`, margin, yPosition)
    yPosition += 7
    doc.text(`Email: ${user.email}`, margin, yPosition)
    yPosition += 7
    doc.text(`User ID: ${userId}`, margin, yPosition)
    yPosition += 15

    // Accepted Documents
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('ACCEPTED DOCUMENTS', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    relevantAcceptances.forEach((acc: any) => {
        const termTypeLabel = acc.term.term_type === 'terms_of_service' ? 'Terms of Service' : 'Privacy Policy'
        doc.text(`- ${termTypeLabel}: ${acc.term.title} (v${acc.term.version})`, margin, yPosition)
        yPosition += 7
    })
    yPosition += 8

    // Acceptance Details
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('ACCEPTANCE DETAILS', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const acceptDate = new Date(primaryAcceptance.accepted_at).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'long'
    })
    doc.text(`Timestamp: ${acceptDate}`, margin, yPosition)
    yPosition += 7
    doc.text(`IP Address: ${primaryAcceptance.ip_address || 'N/A'}`, margin, yPosition)
    yPosition += 7
    doc.text(`User Agent: ${primaryAcceptance.user_agent || 'N/A'}`, margin, yPosition)
    yPosition += 15

    // Term Content
    if (yPosition > 240) {
        doc.addPage()
        yPosition = 20
    }

    // Loop through each relevant term and add its content
    relevantAcceptances.forEach((acc: any, index: number) => {
        if (index > 0) {
            doc.addPage()
            yPosition = 20
        }

        const termTypeLabel = acc.term.term_type === 'terms_of_service' ? 'Terms of Service' : 'Privacy Policy'
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`CONTENT: ${termTypeLabel.toUpperCase()}`, margin, yPosition)
        yPosition += 10

        // Parse HTML content
        const htmlParser = createHTMLParser(doc, margin, pageWidth, yPosition)
        yPosition = htmlParser.parse(acc.term.content || '')
        yPosition += 15
    })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    const footerY = doc.internal.pageSize.getHeight() - 20
    doc.text('This certificate serves as proof of terms acceptance.', pageWidth / 2, footerY - 5, { align: 'center' })
    doc.text('323 Network - Community Platform', pageWidth / 2, footerY, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, pageWidth / 2, footerY + 5, { align: 'center' })
    doc.text(`Certificate ID: ${acceptanceId}`, pageWidth / 2, footerY + 10, { align: 'center' })

    // Convert to base64
    const pdfBase64 = doc.output('datauristring').split(',')[1]
    const primaryTypeLabel = primaryAcceptance.term.term_type === 'terms_of_service' ? 'Terms_of_Service' : 'Privacy_Policy'
    const bundleLabel = relevantAcceptances.length > 1 ? 'Legal_Bundle' : primaryTypeLabel
    const filename = `terms_acceptance_${user.nome.replace(/\s/g, '_')}_${bundleLabel}_${new Date().toISOString().split('T')[0]}.pdf`

    return { pdfData: { pdf: pdfBase64, filename } }
}

async function generateEnrollmentContractPDF(
    supabase: any,
    enrollmentId: string
): Promise<{ pdfData: { pdf: string; filename: string } }> {
    console.log('[generateEnrollmentContractPDF] Starting for enrollment:', enrollmentId)
    
    // Fetch enrollment data with all relations
    const { data: enrollment, error: enrollError } = await supabase
        .from('program_enrollments')
        .select(`
            *,
            program:program_id (
                title_en,
                title_pt,
                price_usd,
                duration_hours
            ),
            user:user_id (
                nome,
                email
            )
        `)
        .eq('id', enrollmentId)
        .single()

    console.log('[generateEnrollmentContractPDF] Query result:', { 
        hasData: !!enrollment, 
        hasError: !!enrollError,
        errorDetails: enrollError 
    })

    if (enrollError) {
        console.error('[generateEnrollmentContractPDF] Supabase error:', enrollError)
        throw new Error(`Failed to fetch enrollment: ${enrollError.message}`)
    }
    
    if (!enrollment) {
        throw new Error('Enrollment not found')
    }

    // Fetch user's accepted terms
    const { data: acceptedTerms } = await supabase
        .from('comprehensive_term_acceptance')
        .select(`
            *,
            term:term_id (
                title,
                term_type,
                version
            )
        `)
        .eq('user_id', enrollment.user_id)
        .order('accepted_at', { ascending: false })

    // Generate PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = 20

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('PROGRAM ENROLLMENT CONTRACT', pageWidth / 2, yPosition, { align: 'center' })
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
    doc.text(`Student ID: ${enrollment.user_id}`, margin, yPosition)
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
    if (enrollment.program.duration_hours) {
        doc.text(`Duration: ${enrollment.program.duration_hours} hours`, margin, yPosition)
        yPosition += 7
    }
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

    // Terms Acceptance Summary
    if (acceptedTerms && acceptedTerms.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('TERMS ACCEPTANCE', margin, yPosition)
        yPosition += 10

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        acceptedTerms.forEach((acceptance: any) => {
            const termTypeLabel = acceptance.term.term_type === 'terms_of_service' ? 'Terms of Service' : 'Privacy Policy'
            const acceptDate = new Date(acceptance.accepted_at).toLocaleString('en-US')
            doc.text(`✓ ${termTypeLabel} (v${acceptance.term.version}) - Accepted on ${acceptDate}`, margin, yPosition)
            yPosition += 6
        })
        yPosition += 10
    }

    // Digital Signature Section
    if (yPosition > 220) {
        doc.addPage()
        yPosition = 20
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DIGITAL SIGNATURE', margin, yPosition)
    yPosition += 10

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('By completing payment and enrollment, the student electronically agrees to all terms and conditions.', margin, yPosition)
    yPosition += 7
    doc.text(`Enrollment ID: ${enrollmentId}`, margin, yPosition)
    yPosition += 7
    doc.text(`Transaction Reference: ${enrollment.payment_id || 'N/A'}`, margin, yPosition)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    const footerY = doc.internal.pageSize.getHeight() - 20
    doc.text('This contract serves as proof of enrollment and payment.', pageWidth / 2, footerY - 5, { align: 'center' })
    doc.text('323 Network - Community Platform', pageWidth / 2, footerY, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, pageWidth / 2, footerY + 5, { align: 'center' })
    doc.text(`Contract ID: ${enrollmentId}`, pageWidth / 2, footerY + 10, { align: 'center' })

    // Convert to base64
    const pdfBase64 = doc.output('datauristring').split(',')[1]
    const programName = (enrollment.program.title_en || enrollment.program.title_pt).replace(/\s/g, '_')
    const filename = `enrollment_contract_${enrollment.user.nome.replace(/\s/g, '_')}_${programName}_${new Date().toISOString().split('T')[0]}.pdf`

    return { pdfData: { pdf: pdfBase64, filename } }
}

async function uploadToStorage(
    supabase: any,
    pdfData: { pdf: string; filename: string },
    userId: string,
    type: string
): Promise<string> {
    // Convert base64 to Uint8Array
    const pdfBytes = Uint8Array.from(atob(pdfData.pdf), c => c.charCodeAt(0))

    // Upload to storage: /{userId}/{type}/{filename}
    const storagePath = `${userId}/${type}/${pdfData.filename}`

    const { error: uploadError } = await supabase.storage
        .from('legal-documents')
        .upload(storagePath, pdfBytes, {
            contentType: 'application/pdf',
            upsert: false
        })

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    return storagePath
}

async function sendEmailWithAttachment(
    supabase: any,
    pdfData: { pdf: string; filename: string },
    userId: string,
    type: string
): Promise<void> {
    // Fetch user name for email subject
    const { data: user } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', userId)
        .single()

    const userName = user?.nome || 'Unknown User'
    
    let subject: string
    let htmlBody: string

    if (type === 'terms_acceptance') {
        subject = `New Terms Acceptance - ${userName}`
        htmlBody = `
            <h2>New Terms Acceptance</h2>
            <p>A user has accepted terms on 323 Network platform.</p>
            <p><strong>User:</strong> ${userName}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Document:</strong> ${pdfData.filename}</p>
            <p>Please find the acceptance certificate attached.</p>
        `
    } else {
        subject = `New Enrollment Contract - ${userName}`
        htmlBody = `
            <h2>New Program Enrollment</h2>
            <p>A new enrollment contract has been generated.</p>
            <p><strong>Student:</strong> ${userName}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Contract:</strong> ${pdfData.filename}</p>
            <p>Please find the enrollment contract attached.</p>
        `
    }

    // Call send-email Edge Function with attachment
    const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
            to: 'admin@323network.com',
            subject,
            html: htmlBody,
            attachments: [{
                filename: pdfData.filename,
                content: pdfData.pdf,
                contentType: 'application/pdf'
            }]
        }
    })

    if (emailError) {
        console.error('[generate-legal-pdf] Error sending email:', emailError)
        // Don't throw - we still want to track the document even if email fails
        // Update the legal_documents record with the error
        await supabase
            .from('legal_documents')
            .update({
                email_sent: false,
                email_error: emailError.message
            })
            .eq('storage_path', `${userId}/${type}/${pdfData.filename}`)
    } else {
        // Mark as sent
        await supabase
            .from('legal_documents')
            .update({
                email_sent: true,
                email_sent_at: new Date().toISOString()
            })
            .eq('storage_path', `${userId}/${type}/${pdfData.filename}`)
    }
}

// HTML Parser helper - simplified version
function createHTMLParser(doc: any, margin: number, pageWidth: number, startY: number) {
    let yPosition = startY

    return {
        parse(html: string): number {
            // Remove script and style tags
            html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            
            // Split by tags
            const parts = html.split(/(<[^>]+>)/)
            
            let currentFont: 'normal' | 'bold' = 'normal'
            let currentSize = 8
            
            parts.forEach(part => {
                if (!part.trim()) return
                
                // Handle tags
                if (part.startsWith('<') && !part.startsWith('</')) {
                    const tag = part.match(/<(\w+)/)?.[1]?.toLowerCase()
                    if (tag === 'h1') { currentFont = 'bold'; currentSize = 12; yPosition += 4 }
                    else if (tag === 'h2') { currentFont = 'bold'; currentSize = 10; yPosition += 3 }
                    else if (tag === 'strong' || tag === 'b') { currentFont = 'bold' }
                    else if (tag === 'p') { yPosition += 2 }
                    else if (tag === 'br') { yPosition += 4 }
                } else if (part.startsWith('</')) {
                    const tag = part.match(/<\/(\w+)/)?.[1]?.toLowerCase()
                    if (tag === 'h1' || tag === 'h2') { currentFont = 'normal'; currentSize = 8; yPosition += 3 }
                    else if (tag === 'strong' || tag === 'b') { currentFont = 'normal' }
                    else if (tag === 'p') { yPosition += 3 }
                } else {
                    // Handle text
                    const text = part.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim()
                    if (text) {
                        doc.setFont('helvetica', currentFont)
                        doc.setFontSize(currentSize)
                        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - 6)
                        lines.forEach((line: string) => {
                            if (yPosition > 270) {
                                doc.addPage()
                                yPosition = 20
                            }
                            doc.text(line, margin + 3, yPosition)
                            yPosition += currentSize * 0.5
                        })
                    }
                }
            })
            
            return yPosition
        }
    }
}
