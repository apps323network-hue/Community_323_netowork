import jsPDF from 'jspdf'
import type { ApplicationTerm, TermAcceptance } from '@/composables/useTermsAcceptance'

export interface TermAcceptanceData {
  student_name: string
  student_email: string
  student_country?: string
  term_title: string
  term_content: string
  accepted_at: string
  ip_address: string | null
  user_agent: string | null
  identity_photo_url?: string | null
}

/**
 * Converte HTML para texto simples preservando estrutura (quebras de linha, parágrafos)
 */
function htmlToText(html: string): string {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Preservar quebras de linha de elementos block
  const blockElements = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'br']
  blockElements.forEach(tag => {
    const elements = tempDiv.querySelectorAll(tag)
    elements.forEach(el => {
      if (tag === 'br') {
        el.replaceWith('\n')
      } else {
        el.insertAdjacentText('beforeend', '\n')
      }
    })
  })
  
  // Remover múltiplas quebras de linha consecutivas (máximo 2)
  let text = tempDiv.textContent || tempDiv.innerText || ''
  text = text.replace(/\n{3,}/g, '\n\n')
  
  return text.trim()
}

/**
 * Quebra texto em linhas que cabem na largura do PDF
 */
function wrapText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const testWidth = doc.getTextWidth(testLine)

    if (testWidth > maxWidth && i > 0) {
      doc.text(line, x, currentY)
      line = words[i] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }

  doc.text(line, x, currentY)
  return currentY + lineHeight
}

/**
 * Gera PDF de aceite de termos
 */
export async function generateTermAcceptancePDF(
  data: TermAcceptanceData
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin
  let currentY = margin

  // Formatar data de aceite (reutilizada em múltiplos lugares)
  const acceptedDate = new Date(data.accepted_at).toLocaleString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  // Cores do tema
  const primaryColor: [number, number, number] = [6, 182, 212] // cyan-500
  const darkColor: [number, number, number] = [15, 23, 42] // slate-900

  // Header com branding
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 30, 'F')

  // Logo/Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('323 Network', margin, 20)

  // Document Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Term Acceptance Certificate', margin, 35)

  currentY = 45

  // Informações do Usuário
  doc.setTextColor(...darkColor)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('User Information', margin, currentY)

  currentY += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  currentY = wrapText(doc, `Name: ${data.student_name || 'N/A'}`, margin, currentY, contentWidth, 6)
  currentY = wrapText(doc, `Email: ${data.student_email || 'N/A'}`, margin, currentY, contentWidth, 6)
  
  if (data.student_country) {
    currentY = wrapText(doc, `Country: ${data.student_country}`, margin, currentY, contentWidth, 6)
  }

  currentY += 5

  // Term Information
  doc.setFont('helvetica', 'bold')
  doc.text('Term Information', margin, currentY)

  currentY += 8

  doc.setFont('helvetica', 'normal')
  currentY = wrapText(doc, `Title: ${data.term_title}`, margin, currentY, contentWidth, 6)
  currentY = wrapText(doc, `Accepted At: ${acceptedDate}`, margin, currentY, contentWidth, 6)

  currentY += 10

  // Divider
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 5

  // Term Content
  doc.setFont('helvetica', 'bold')
  doc.text('Term Content', margin, currentY)
  currentY += 8

  // Renderizar HTML do termo - usar abordagem mais simples e segura
  // Para documentos longos, converter HTML para texto formatado preservando estrutura
  const termText = htmlToText(data.term_content)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // Processar o texto preservando parágrafos e estrutura básica
  const paragraphs = termText.split(/\n\s*\n/).filter(p => p.trim())
  
  for (const paragraph of paragraphs) {
    if (currentY > pageHeight - 30) {
      doc.addPage()
      currentY = margin
    }

    // Verificar se é um título (linhas curtas, geralmente em maiúsculas ou com formatação especial)
    const isTitle = paragraph.length < 100 && (
      paragraph.toUpperCase() === paragraph ||
      paragraph.match(/^\d+[\)\.]/) ||
      paragraph.match(/^[A-Z][a-z]+:/)
    )

    if (isTitle) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      currentY = wrapText(doc, paragraph.trim(), margin, currentY, contentWidth, 6)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      currentY += 3
    } else {
      // Parágrafo normal
      const lines = paragraph.split('\n').filter(l => l.trim())
      for (const line of lines) {
        if (currentY > pageHeight - 30) {
          doc.addPage()
          currentY = margin
        }
        currentY = wrapText(doc, line.trim(), margin, currentY, contentWidth, 5)
      }
      currentY += 4 // Espaço entre parágrafos
    }
  }

  // Nova página para metadados
  doc.addPage()
  currentY = margin

  // Metadata Section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Acceptance Metadata', margin, currentY)

  currentY += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  // Repetir informações do usuário e data/hora
  doc.setFont('helvetica', 'bold')
  doc.text('User Information:', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'normal')
  currentY = wrapText(doc, `Name: ${data.student_name || 'N/A'}`, margin, currentY, contentWidth, 6)
  currentY = wrapText(doc, `Email: ${data.student_email || 'N/A'}`, margin, currentY, contentWidth, 6)
  currentY = wrapText(doc, `Accepted At: ${acceptedDate}`, margin, currentY, contentWidth, 6)

  currentY += 8

  // Informações técnicas
  doc.setFont('helvetica', 'bold')
  doc.text('Technical Information:', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'normal')

  if (data.ip_address) {
    currentY = wrapText(doc, `IP Address: ${data.ip_address}`, margin, currentY, contentWidth, 6)
  }

  if (data.user_agent) {
    const userAgentLines = doc.splitTextToSize(`User Agent: ${data.user_agent}`, contentWidth)
    doc.text(userAgentLines, margin, currentY)
    currentY += userAgentLines.length * 6
  }

  currentY += 10

  // Identity Photo (se disponível)
  if (data.identity_photo_url) {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = data.identity_photo_url!
      })

      // Adicionar foto se houver espaço
      if (currentY < pageHeight - 60) {
        const imgWidth = 40
        const imgHeight = (img.height / img.width) * imgWidth

        doc.addImage(
          img,
          'JPEG',
          pageWidth - margin - imgWidth,
          currentY,
          imgWidth,
          imgHeight
        )

        doc.setFont('helvetica', 'bold')
        doc.text('Identity Verification Photo', margin, currentY)
        currentY += imgHeight + 10
      }
    } catch (err) {
      console.warn('Erro ao adicionar foto de identidade ao PDF:', err)
    }
  }

  // Footer Legal
  currentY = pageHeight - 20
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 5

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  const footerText = 'This document serves as legal proof of term acceptance. Generated automatically by 323 Network platform.'
  const footerLines = doc.splitTextToSize(footerText, contentWidth)
  doc.text(footerLines, margin, currentY)

  // Salvar PDF
  const fileName = `term-acceptance-${data.student_email}-${new Date(data.accepted_at).getTime()}.pdf`
  doc.save(fileName)
}

/**
 * Gera PDF a partir de dados de aceite do banco
 */
export async function generatePDFFromAcceptance(
  acceptance: TermAcceptance & { term: ApplicationTerm },
  userProfile: {
    nome: string
    email: string
    pais?: string
    avatar_url?: string
  }
): Promise<void> {
  const data: TermAcceptanceData = {
    student_name: userProfile.nome,
    student_email: userProfile.email,
    student_country: userProfile.pais,
    term_title: acceptance.term.title,
    term_content: acceptance.term.content,
    accepted_at: acceptance.accepted_at,
    ip_address: acceptance.ip_address,
    user_agent: acceptance.user_agent,
    identity_photo_url: userProfile.avatar_url || null,
  }

  await generateTermAcceptancePDF(data)
}
