import { useSupabase } from '@/composables/useSupabase'
import { toast } from 'vue-sonner'

/**
 * Composable para exportar dados completos de matrícula
 */
export function useEnrollmentExport() {
  const { supabase } = useSupabase()

  /**
   * Exporta dados completos de matrícula em PDF
   */
  async function exportEnrollmentPDF(enrollmentId: string) {
    try {
      toast.loading('Gerando PDF com dados completos...')

      const { data, error } = await supabase.functions.invoke('export-enrollment-data', {
        body: {
          enrollment_id: enrollmentId,
          format: 'pdf'
        }
      })

      if (error) throw error

      // Converter base64 para blob e fazer download
      const pdfBlob = base64ToBlob(data.pdf, 'application/pdf')
      downloadBlob(pdfBlob, data.filename)

      toast.dismiss()
      toast.success('PDF gerado com sucesso!')
      return true
    } catch (error: any) {
      console.error('Error exporting enrollment PDF:', error)
      toast.dismiss()
      toast.error(error.message || 'Erro ao gerar PDF')
      return false
    }
  }

  /**
   * Exporta dados completos de matrícula em CSV
   */
  async function exportEnrollmentCSV(enrollmentId: string) {
    try {
      toast.loading('Gerando CSV com dados completos...')

      const { data, error } = await supabase.functions.invoke('export-enrollment-data', {
        body: {
          enrollment_id: enrollmentId,
          format: 'csv'
        }
      })

      if (error) throw error

      // Converter base64 para blob e fazer download
      const csvBlob = base64ToBlob(data.csv, 'text/csv')
      downloadBlob(csvBlob, data.filename)

      toast.dismiss()
      toast.success('CSV gerado com sucesso!')
      return true
    } catch (error: any) {
      console.error('Error exporting enrollment CSV:', error)
      toast.dismiss()
      toast.error(error.message || 'Erro ao gerar CSV')
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
    exportEnrollmentPDF,
    exportEnrollmentCSV
  }
}
