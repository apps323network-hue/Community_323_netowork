import { useSupabase } from './useSupabase'
import type { AdminService } from '@/types/admin'

export function useSSO() {
  const { supabase } = useSupabase()
  
  /**
   * Detecta o ambiente e retorna a URL correta do serviço externo
   * @param service - Serviço externo com SSO habilitado
   * @returns URL base do serviço externo baseada no ambiente
   */
  function getExternalUrl(service: AdminService): string {
    // Detectar se está em desenvolvimento (localhost ou IP local)
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname === '192.168.101.3' ||
                          window.location.hostname.includes('localhost')
    
    // Se for MatrículaUSA, usar URLs específicas por ambiente
    if (service.nome_pt === 'MatrículaUSA' || service.nome_pt?.includes('Matrícula')) {
      if (isDevelopment) {
        // URL de desenvolvimento do Matrícula US (IP local)
        return 'http://192.168.101.3:5173'
      } else {
        // URL de produção
        return service.external_url || 'https://matriculausa.com'
      }
    }
    
    // Para outros serviços, usar a URL do banco de dados
    return service.external_url || ''
  }
  
  /**
   * Gera URL SSO para redirecionamento a serviço externo
   * @param service - Serviço externo com SSO habilitado
   * @param returnTo - URL opcional para redirecionamento após autenticação
   * @returns URL completa com token JWT na query string
   */
  async function generateSSOUrl(service: AdminService, returnTo?: string): Promise<string> {
    if (!service.is_external || !service.sso_enabled) {
      throw new Error('Serviço não configurado para SSO externo')
    }

    // Obter sessão atual do usuário
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('[SSO] Erro ao obter sessão:', sessionError)
      throw new Error('Erro ao obter sessão de autenticação')
    }
    
    if (!session?.access_token) {
      throw new Error('Usuário não autenticado. Faça login primeiro.')
    }

    // Obter URL base dinamicamente baseada no ambiente
    const baseUrl = getExternalUrl(service)
    
    if (!baseUrl) {
      throw new Error('URL do serviço externo não configurada')
    }

    const callbackPath = service.sso_callback_path || '/auth/callback'
    
    // Garantir que baseUrl termina sem barra e callbackPath começa com barra
    const cleanBaseUrl = baseUrl.replace(/\/$/, '')
    const cleanCallbackPath = callbackPath.startsWith('/') ? callbackPath : `/${callbackPath}`
    
    const url = new URL(cleanCallbackPath, cleanBaseUrl)
    
    // Adicionar parâmetros de query
    url.searchParams.set('token', session.access_token)
    url.searchParams.set('source', '323-network')
    
    if (returnTo) {
      url.searchParams.set('returnTo', returnTo)
    }

    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1'
    
    console.log(`[SSO] Ambiente: ${isDevelopment ? 'DESENVOLVIMENTO' : 'PRODUÇÃO'}`)
    console.log('[SSO] URL gerada para serviço externo:', url.toString().replace(/token=[^&]+/, 'token=***'))
    
    return url.toString()
  }
  
  return { generateSSOUrl }
}
