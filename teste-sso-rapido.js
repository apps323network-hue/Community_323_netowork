/**
 * Script de Teste Rápido - SSO 323 Network ↔ American Dream
 * 
 * INSTRUÇÕES:
 * 1. Faça login no 323 Network (https://323network.com/login)
 * 2. Abra o DevTools (F12) > Console
 * 3. Cole e execute este script completo
 * 4. Siga as instruções que aparecerão no console
 */

(async function testSSO() {
  console.log('🧪 Iniciando Teste de SSO...\n')
  
  // Verificar se está no 323 Network
  if (!window.supabase) {
    console.error('❌ Supabase não encontrado. Certifique-se de estar logado no 323 Network.')
    return
  }

  try {
    // 1. Obter token atual
    console.log('1️⃣ Obtendo token atual...')
    const { data: sessionData, error: sessionError } = await window.supabase.auth.getSession()
    
    if (sessionError || !sessionData?.session) {
      console.error('❌ Erro ao obter sessão:', sessionError)
      console.log('💡 Faça login primeiro em https://323network.com/login')
      return
    }

    const token = sessionData.session.access_token
    const user = sessionData.session.user
    
    console.log('✅ Token obtido com sucesso!')
    console.log('📧 Email do usuário:', user.email)
    console.log('🆔 User ID:', user.id)
    console.log('🔑 Token (primeiros 50 caracteres):', token.substring(0, 50) + '...\n')

    // 2. Decodificar token para verificar informações
    console.log('2️⃣ Decodificando token...')
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('✅ Token decodificado:')
      console.log('   - Email:', payload.email)
      console.log('   - Expira em:', new Date(payload.exp * 1000).toLocaleString())
      console.log('   - Issuer:', payload.iss)
      console.log('   - Source (user_metadata):', payload.user_metadata?.source || 'não definido')
      console.log('')
    } catch (e) {
      console.warn('⚠️ Não foi possível decodificar token:', e)
    }

    // 3. Testar validação do token
    console.log('3️⃣ Testando validação do token...')
    console.log('💡 Para testar no American Dream, use este URL:')
    console.log('')
    console.log(`https://americandream.com/auth/callback?token=${token}&redirect=/payment`)
    console.log('')
    console.log('📋 Ou copie apenas o token:')
    console.log(token)
    console.log('')

    // 4. Verificar se Edge Function está funcionando
    console.log('4️⃣ Testando Edge Function sync-user-to-american-dream...')
    console.log('💡 Isso testará se a sincronização está funcionando')
    console.log('')
    
    const testEmail = `teste.sso.${Date.now()}@example.com`
    console.log('📧 Email de teste gerado:', testEmail)
    console.log('')
    console.log('⚠️  Para testar criação de usuário:')
    console.log('   1. Vá para https://323network.com/register')
    console.log('   2. Crie uma conta com um email novo')
    console.log('   3. Verifique no Dashboard do American Dream se o usuário foi criado')
    console.log('')

    // 5. Instruções finais
    console.log('✅ Teste concluído!')
    console.log('')
    console.log('📝 PRÓXIMOS PASSOS:')
    console.log('   1. Copie o URL acima e cole no navegador')
    console.log('   2. Se funcionar: você será redirecionado para /payment já autenticado ✅')
    console.log('   3. Se não funcionar: será redirecionado para login ❌')
    console.log('')
    console.log('🔍 Se não funcionar, verifique:')
    console.log('   - JWT Secret está configurado corretamente no American Dream?')
    console.log('   - Access Token Expiry é 604800 em ambos os projetos?')
    console.log('   - Token não expirou? (expira em 7 dias)')
    console.log('')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
})()

