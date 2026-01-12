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
 * Interface para elementos estruturados do HTML
 */
interface StructuredElement {
  type: 'paragraph' | 'heading' | 'list' | 'listItem' | 'blockquote' | 'text'
  level?: number // Para headings (1-6) e list items
  content: string
  isOrdered?: boolean // Para listas ordenadas
  children?: StructuredElement[]
}

/**
 * Extrai texto de um elemento HTML preservando estrutura básica
 */
function extractTextContent(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    // Normalizar espaços em branco (múltiplos espaços/quebras viram um espaço)
    return text.replace(/\s+/g, ' ').trim()
  }
  
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement
    const tagName = el.tagName.toLowerCase()
    
    // Para <br>, retornar quebra de linha (mas vamos tratar isso no parsing)
    if (tagName === 'br') {
      return ' '
    }
    
    // Processar filhos recursivamente
    const parts: string[] = []
    Array.from(node.childNodes).forEach(child => {
      const childText = extractTextContent(child)
      if (childText && childText.trim().length > 0) {
        parts.push(childText.trim())
      }
    })
    
    // Juntar partes com espaço único
    const text = parts.join(' ').trim()
    
    // Normalizar espaços finais
    return text.replace(/\s+/g, ' ')
  }
  
  return ''
}

/**
 * Converte HTML para estrutura preservando formatação
 */
function parseHTMLToStructured(html: string): StructuredElement[] {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  const elements: StructuredElement[] = []
  
  function processNode(node: Node): StructuredElement | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (!text) return null
      return {
        type: 'text',
        content: text,
      }
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tagName = el.tagName.toLowerCase()
      
      // Processar headings
      if (tagName.match(/^h[1-6]$/)) {
        const level = parseInt(tagName.charAt(1))
        const content = extractTextContent(el).trim()
        if (content) {
          return {
            type: 'heading',
            level,
            content,
          }
        }
      }
      
      // Processar parágrafos
      if (tagName === 'p') {
        // IGNORAR parágrafos que estão dentro de <li> - eles já são processados como parte do item da lista
        const parentTag = el.parentElement?.tagName.toLowerCase()
        if (parentTag === 'li') {
          return null // Não processar <p> dentro de <li>
        }
        
        const content = extractTextContent(el).trim()
        // Filtrar parágrafos vazios (apenas espaços ou quebras de linha)
        if (content && content.replace(/\s+/g, '').length > 0) {
          return {
            type: 'paragraph',
            content,
          }
        }
      }
      
      // Processar listas
      if (tagName === 'ul' || tagName === 'ol') {
        const listItems: StructuredElement[] = []
        Array.from(el.children).forEach((child, index) => {
          if (child.tagName.toLowerCase() === 'li') {
            // Extrair TODO o conteúdo do <li>, incluindo texto dentro de <p>
            // Isso evita que <p> dentro de <li> sejam processados como parágrafos separados
            const itemContent = extractTextContent(child).trim()
            // Filtrar itens vazios ou apenas espaços
            if (itemContent && itemContent.replace(/\s+/g, '').length > 0) {
              listItems.push({
                type: 'listItem',
                level: index + 1,
                content: itemContent,
                isOrdered: tagName === 'ol',
              })
            }
          }
        })
        
        // Só retornar lista se tiver pelo menos um item válido
        if (listItems.length > 0) {
          return {
            type: 'list',
            isOrdered: tagName === 'ol',
            content: '',
            children: listItems,
          }
        }
      }
      
      // Processar blockquotes
      if (tagName === 'blockquote') {
        const content = extractTextContent(el).trim()
        if (content) {
          return {
            type: 'blockquote',
            content,
          }
        }
      }
      
      // Para outros elementos (div, span, strong, em, etc.), processar filhos recursivamente
      // Mas não criar um elemento próprio, apenas processar os filhos
      // IMPORTANTE: Não processar <li> aqui - eles são processados apenas dentro de <ul>/<ol>
      if (tagName === 'li') {
        // <li> são processados apenas quando encontrados dentro de <ul>/<ol>
        // Não processar como elemento separado aqui
        return null
      }
      
      const children: StructuredElement[] = []
      Array.from(node.childNodes).forEach(child => {
        const processed = processNode(child)
        if (processed) {
          // Filtrar elementos vazios
          if (processed.content && processed.content.trim().length > 0) {
            children.push(processed)
          } else if (processed.type === 'list' && processed.children && processed.children.length > 0) {
            // Incluir listas mesmo se não tiverem content próprio
            children.push(processed)
          }
        }
      })
      
      // Se temos filhos válidos, retornar o primeiro elemento block ou combinar textos
      if (children.length > 0) {
        // Se todos são texto, combinar em um parágrafo
        if (children.every(c => c.type === 'text')) {
          const combinedText = children.map(c => c.content).join(' ').trim()
          if (combinedText && combinedText.replace(/\s+/g, '').length > 0) {
            return {
              type: 'paragraph',
              content: combinedText,
            }
          }
        } else {
          // Se há elementos block, retornar null para que sejam processados no nível superior
          // Isso permite que divs contenham múltiplos parágrafos
          return null
        }
      }
    }
    
    return null
  }
  
  // Processar todos os nós filhos do div
  function processAllNodes(nodes: NodeList): StructuredElement[] {
    const result: StructuredElement[] = []
    
    Array.from(nodes).forEach(node => {
      // Ignorar nós de texto soltos (fora de elementos)
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text && text.replace(/\s+/g, '').length > 0) {
          // Se há texto solto, criar um parágrafo
          result.push({
            type: 'paragraph',
            content: text,
          })
        }
        return
      }
      
      const processed = processNode(node)
      if (processed) {
        // Validar antes de adicionar
        if (processed.type === 'list' && processed.children && processed.children.length > 0) {
          result.push(processed)
        } else if (processed.content && processed.content.trim().replace(/\s+/g, '').length > 0) {
          result.push(processed)
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Se retornou null, processar filhos recursivamente
        const el = node as HTMLElement
        const childElements = processAllNodes(el.childNodes)
        result.push(...childElements)
      }
    })
    
    return result
  }
  
  return processAllNodes(tempDiv.childNodes)
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
  // Filtrar texto vazio
  if (!text || text.trim().length === 0) {
    return y
  }

  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  if (words.length === 0) {
    return y
  }

  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + (line ? ' ' : '') + words[i]
    const testWidth = doc.getTextWidth(testLine)

    if (testWidth > maxWidth && line.length > 0) {
      doc.text(line, x, currentY)
      line = words[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }

  // Renderizar última linha se houver conteúdo
  if (line.trim().length > 0) {
    doc.text(line, x, currentY)
    currentY += lineHeight
  }

  return currentY
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

  // Renderizar HTML do termo preservando formatação
  const structuredElements = parseHTMLToStructured(data.term_content)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // Filtrar elementos vazios antes de renderizar
  const validElements = structuredElements.filter((element, index) => {
    // Filtrar elementos com conteúdo vazio ou apenas espaços
    if (element.type !== 'list') {
      if (!element.content || element.content.trim().length === 0) {
        return false
      }
      // Verificar se o conteúdo tem pelo menos um caractere não-whitespace
      if (element.content.replace(/\s+/g, '').length === 0) {
        return false
      }
    }
    
    // Filtrar listas sem itens válidos
    if (element.type === 'list') {
      if (!element.children || element.children.length === 0) {
        return false
      }
      // Verificar se há pelo menos um item com conteúdo válido
      const hasValidItems = element.children.some(item => 
        item.content && item.content.trim().replace(/\s+/g, '').length > 0
      )
      if (!hasValidItems) {
        return false
      }
    }
    
    return true
  })

  function renderStructuredElement(element: StructuredElement, index: number): void {
    if (currentY > pageHeight - 30) {
      doc.addPage()
      currentY = margin
    }

    const isFirstElement = index === 0

    switch (element.type) {
      case 'heading': {
        // Títulos com tamanho baseado no nível
        const fontSize = 14 - (element.level || 1)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(fontSize)
        // Adicionar espaço antes apenas se não for o primeiro elemento
        if (!isFirstElement) {
          currentY += 3
        }
        currentY = wrapText(doc, element.content.trim(), margin, currentY, contentWidth, fontSize * 0.35)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        currentY += 1.5 // Espaço reduzido após o título
        break
      }

      case 'paragraph': {
        // Parágrafos normais - apenas adicionar espaço se não for o primeiro elemento
        if (!isFirstElement) {
          currentY += 1.5
        }
        currentY = wrapText(doc, element.content.trim(), margin, currentY, contentWidth, 4.5)
        break
      }

      case 'list': {
        // Listas (ordenadas ou não)
        if (!isFirstElement) {
          currentY += 2
        }
        if (element.children && element.children.length > 0) {
          // Filtrar itens vazios antes de renderizar
          const validItems = element.children.filter(item => 
            item.content && item.content.trim().length > 0
          )
          
          validItems.forEach((item, itemIndex) => {
            if (currentY > pageHeight - 30) {
              doc.addPage()
              currentY = margin
            }
            
            const prefix = element.isOrdered 
              ? `${itemIndex + 1}. ` 
              : '• '
            
            // Renderizar item da lista com indentação
            const indent = 5
            const itemText = prefix + item.content.trim()
            currentY = wrapText(doc, itemText, margin + indent, currentY, contentWidth - indent, 4.5)
            // Espaço mínimo entre itens (apenas se não for o último)
            if (itemIndex < validItems.length - 1) {
              currentY += 0.5
            }
          })
        }
        break
      }

      case 'blockquote': {
        // Blockquotes com indentação e estilo diferenciado
        if (!isFirstElement) {
          currentY += 1.5
        }
        doc.setFont('helvetica', 'italic')
        const quoteIndent = 8
        currentY = wrapText(doc, element.content.trim(), margin + quoteIndent, currentY, contentWidth - quoteIndent, 4.5)
        doc.setFont('helvetica', 'normal')
        break
      }

      case 'text': {
        // Texto simples (usado como fallback)
        if (!isFirstElement) {
          currentY += 1
        }
        currentY = wrapText(doc, element.content.trim(), margin, currentY, contentWidth, 4.5)
        break
      }
    }
  }

  // Renderizar todos os elementos válidos
  validElements.forEach((element, index) => {
    renderStructuredElement(element, index)
  })

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
