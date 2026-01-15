import { useSupabase } from '@/composables/useSupabase'
import { toast } from 'vue-sonner'

/**
 * Composable para gerar e baixar comprovantes em PDF
 */
export function useProofGenerator() {
  const { supabase } = useSupabase()

  /**
   * Gera e baixa comprovante de assinatura de termos
   */
  async function downloadTermAcceptanceProof(acceptanceId: string) {
    try {
      toast.loading('Gerando comprovante...')

      const { data, error } = await supabase.functions.invoke('generate-proof-pdf', {
        body: {
          type: 'term_acceptance',
          id: acceptanceId
        }
      })

      if (error) throw error

      // Converter base64 para blob e fazer download
      const pdfBlob = base64ToBlob(data.pdf, 'application/pdf')
      downloadBlob(pdfBlob, data.filename)

      toast.success('Comprovante gerado com sucesso!')
      return true
    } catch (error: any) {
      console.error('Error generating term acceptance proof:', error)
      toast.error(error.message || 'Erro ao gerar comprovante')
      return false
    }
  }

  /**
   * Gera e baixa comprovante de pagamento
   */
  async function downloadPaymentProof(enrollmentId: string) {
    try {
      toast.loading('Gerando comprovante de pagamento...')

      const { data, error } = await supabase.functions.invoke('generate-proof-pdf', {
        body: {
          type: 'payment_proof',
          id: enrollmentId
        }
      })

      if (error) throw error

      // Converter base64 para blob e fazer download
      const pdfBlob = base64ToBlob(data.pdf, 'application/pdf')
      downloadBlob(pdfBlob, data.filename)

      toast.success('Comprovante de pagamento gerado com sucesso!')
      return true
    } catch (error: any) {
      console.error('Error generating payment proof:', error)
      toast.error(error.message || 'Erro ao gerar comprovante de pagamento')
      return false
    }
  }

  /**
   * Converte base64 para Blob
   */
  function base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: contentType })
  }

  /**
   * Faz download de um blob
   */
  function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return {
    downloadTermAcceptanceProof,
    downloadPaymentProof
  }
}
