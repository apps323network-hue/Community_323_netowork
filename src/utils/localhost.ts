/**
 * Utilitários para verificar se está rodando em localhost
 */

/**
 * Verifica se a aplicação está rodando em localhost
 * @returns true se estiver em localhost, false caso contrário
 */
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: verificar variável de ambiente
    return process.env.NODE_ENV === 'development' || 
           process.env.VITE_IS_LOCALHOST === 'true'
  }

  // Client-side: verificar hostname
  const hostname = window.location.hostname
  
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local')
  )
}

/**
 * Verifica se pode acessar um programa em modo localhost
 * @param program - O programa a ser verificado
 * @returns true se pode acessar localmente, false caso contrário
 */
export function canAccessLocalhost(program: { localhost_only?: boolean }): boolean {
  if (!program.localhost_only) {
    return false
  }
  
  return isLocalhost()
}
