# 🚀 Plano de Implementação: Fluxo American Dream → 323 Network → American Dream

**Baseado nas informações coletadas do American Dream**

---

## 📋 Resumo das Informações

### American Dream
- **URL de produção**: `https://americandream.323network.com/`
- **Página de pagamento**: `/payment-options`
- **Página de registro**: `/lead-form`
- **Formulário**: `src/pages/LeadForm.tsx`
- **Campos**: name, email, phone, phoneCountryCode, termsAccepted
- **Tabela leads**: user_id pode ser null (não obrigatório)

### 323 Network
- **URL de produção**: `https://323network.com/`
- **URL de login/registro**: `https://323network.com/login?redirect=/`
- **Rota de registro**: `/login` (mesma rota, com toggle entre login/registro)

---

## 🔧 Implementação no 323 Network

### 1. Detectar Origem e Pré-preencher Formulário

**Arquivo**: `src/views/Login.vue`

**O que fazer**:
- Ler query parameters: `source`, `returnTo`, `email`, `name`, `phone`, `phoneCountryCode`
- Se `source=american-dream`, pré-preencher campos do formulário
- Passar `source` e `returnTo` para o `signUp`

**Código necessário**:
```typescript
// No setup() do Login.vue
const route = useRoute()
const source = route.query.source as string
const returnTo = route.query.returnTo as string
const prefillEmail = route.query.email as string
const prefillName = route.query.name as string
const prefillPhone = route.query.phone as string
const prefillCountryCode = route.query.phoneCountryCode as string || 'BR'

// Pré-preencher formulário se veio do American Dream
if (source === 'american-dream') {
  if (prefillEmail) registerForm.value.email = prefillEmail
  if (prefillName) {
    const nameParts = prefillName.split(' ')
    registerForm.value.firstName = nameParts[0] || ''
    registerForm.value.lastName = nameParts.slice(1).join(' ') || ''
  }
  if (prefillPhone) registerForm.value.phone = prefillPhone
  // phoneCountryCode pode ser usado se necessário
}

// Ao fazer registro
await authStore.signUp(
  registerForm.value.email,
  registerForm.value.password,
  {
    firstName: registerForm.value.firstName,
    lastName: registerForm.value.lastName,
    nome: `${registerForm.value.firstName} ${registerForm.value.lastName}`,
    phone: registerForm.value.phone || null,
    source: source || '323-network',
    returnTo: returnTo || null,
    phoneCountryCode: prefillCountryCode || 'BR'
  }
)
```

### 2. Auto-confirmar Email e Redirecionar

**Arquivo**: `src/stores/auth.ts`

**O que fazer**:
- Se `source === 'american-dream'`, usar `admin.createUser()` com `email_confirm: true`
- Após criar usuário, obter token de sessão
- Redirecionar para `{returnTo}?token={JWT_TOKEN}`

**Código necessário**:
```typescript
async function signUp(email: string, password: string, userData?: Record<string, any>) {
  loading.value = true
  error.value = null
  try {
    // Se veio do American Dream, usar admin API para confirmar email automaticamente
    if (userData?.source === 'american-dream') {
      // Criar usuário com email já confirmado
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // ✅ Email já confirmado
        user_metadata: {
          ...userData,
          source: 'american-dream',
          phoneCountryCode: userData?.phoneCountryCode || 'BR'
        },
      })
      
      if (adminError) throw adminError
      if (!adminData.user) throw new Error('Falha ao criar usuário')
      
      user.value = adminData.user
      
      // Obter sessão para pegar o token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      
      // Se tiver returnTo, redirecionar com token
      if (userData?.returnTo && session?.access_token) {
        const returnUrl = new URL(userData.returnTo)
        returnUrl.searchParams.set('token', session.access_token)
        // Adicionar dados do usuário se necessário
        returnUrl.searchParams.set('email', email)
        returnUrl.searchParams.set('name', userData.nome || email.split('@')[0])
        window.location.href = returnUrl.toString()
        return { success: true, redirected: true }
      }
      
      return { success: true }
    }
    
    // Fluxo normal (não veio do American Dream)
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    // ... resto do código normal
  } catch (err: any) {
    error.value = err.message
    return { success: false, error: err.message }
  } finally {
    loading.value = false
  }
}
```

### 3. Sincronizar com American Dream (já existe)

A Edge Function `sync-user-to-american-dream` já cria o usuário e lead no American Dream automaticamente.

---

## 🔧 Implementação no American Dream

### 1. Modificar LeadForm.tsx

**Arquivo**: `src/pages/LeadForm.tsx`

**O que fazer**:
- Ao invés de criar lead diretamente, redirecionar para 323 Network
- Passar dados via query parameters

**Código necessário**:
```typescript
// No handleSubmit do LeadForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Validar formulário (código existente)
  // ...
  
  // Ao invés de criar lead diretamente, redirecionar para 323 Network
  const returnTo = encodeURIComponent(
    `https://americandream.323network.com/payment-options?country=${detectedCountry}`
  )
  
  // URL de produção da 323 Network: https://323network.com/login
  const redirectUrl = new URL('https://323network.com/login')
  redirectUrl.searchParams.set('source', 'american-dream')
  redirectUrl.searchParams.set('returnTo', returnTo)
  redirectUrl.searchParams.set('email', formData.email)
  redirectUrl.searchParams.set('name', formData.name)
  redirectUrl.searchParams.set('phone', formattedPhone) // Telefone já formatado
  redirectUrl.searchParams.set('phoneCountryCode', formData.phoneCountryCode)
  
  window.location.href = redirectUrl.toString()
}
```

### 2. Criar Rota de Callback

**Arquivo**: `src/pages/AuthCallback.tsx` (NOVO)

**O que fazer**:
- Receber token JWT via URL
- Autenticar usuário com `supabase.auth.setSession()`
- Buscar lead existente pelo email ou criar novo
- Vincular lead ao `user_id`
- Redirecionar para `/payment-options`

**Código necessário**:
```typescript
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')
      const name = searchParams.get('name')
      const country = searchParams.get('country') || 'US'
      
      if (!token) {
        console.error('Token não encontrado na URL')
        navigate('/lead-form')
        return
      }
      
      try {
        // Autenticar usuário com o token
        const { data: { session }, error: authError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: '' // Supabase vai gerenciar
        })
        
        if (authError) throw authError
        if (!session?.user) throw new Error('Falha ao autenticar usuário')
        
        // Buscar lead existente pelo email
        const { data: existingLead, error: leadError } = await supabase
          .from('leads')
          .select('id, user_id, term_acceptance_id')
          .eq('email', session.user.email!)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        let leadId = existingLead?.id
        let termAcceptanceId = existingLead?.term_acceptance_id
        
        // Se lead não existe, criar novo
        if (!existingLead || leadError) {
          // Buscar term_acceptance mais recente ou criar novo
          // (ajustar conforme lógica do sistema)
          
          const { data: newLead, error: createError } = await supabase
            .from('leads')
            .insert({
              name: name || session.user.user_metadata.nome || session.user.email!.split('@')[0],
              email: session.user.email!,
              phone: session.user.user_metadata.phone || '',
              country_code: session.user.user_metadata.phoneCountryCode || null,
              user_id: session.user.id,
              status_geral: 'novo'
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Erro ao criar lead:', createError)
            // Continuar mesmo assim
          } else {
            leadId = newLead.id
          }
        } else if (existingLead && !existingLead.user_id) {
          // Vincular lead existente ao user_id
          const { error: updateError } = await supabase
            .from('leads')
            .update({ user_id: session.user.id })
            .eq('id', existingLead.id)
          
          if (updateError) {
            console.error('Erro ao vincular lead:', updateError)
          }
        }
        
        // Redirecionar para payment-options
        const paymentUrl = new URL('/payment-options', window.location.origin)
        if (leadId) paymentUrl.searchParams.set('lead_id', leadId)
        if (termAcceptanceId) paymentUrl.searchParams.set('term_acceptance_id', termAcceptanceId)
        paymentUrl.searchParams.set('country', country)
        
        navigate(paymentUrl.pathname + paymentUrl.search)
      } catch (error) {
        console.error('Erro no callback:', error)
        navigate('/lead-form')
      }
    }
    
    handleCallback()
  }, [searchParams, navigate])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processando Autenticação...</h1>
        <p className="text-gray-600">Por favor, aguarde...</p>
      </div>
    </div>
  )
}
```

### 3. Adicionar Rota no Router

**Arquivo**: `src/router/index.tsx` ou similar

**Código necessário**:
```typescript
import AuthCallback from '@/pages/AuthCallback'

// Adicionar rota
{
  path: '/auth/callback',
  element: <AuthCallback />
}
```

### 4. Modificar PaymentOptions.tsx (Opcional)

**Arquivo**: `src/pages/PaymentOptions.tsx`

**O que fazer**:
- Verificar se há token na URL
- Se houver, autenticar antes de mostrar a página
- Vincular lead ao `user_id` se ainda não estiver vinculado

**Código necessário**:
```typescript
// No início do componente PaymentOptions
useEffect(() => {
  const checkAuth = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    
    if (token) {
      try {
        const { data: { session }, error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        })
        
        if (!error && session?.user) {
          // Vincular lead ao user_id se necessário
          const leadId = urlParams.get('lead_id')
          if (leadId) {
            const { data: lead } = await supabase
              .from('leads')
              .select('user_id')
              .eq('id', leadId)
              .single()
            
            if (lead && !lead.user_id) {
              await supabase
                .from('leads')
                .update({ user_id: session.user.id })
                .eq('id', leadId)
            }
          }
          
          // Remover token da URL
          urlParams.delete('token')
          window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`)
        }
      } catch (error) {
        console.error('Erro ao autenticar:', error)
      }
    }
  }
  
  checkAuth()
}, [])
```

---

## 📝 Checklist de Implementação

### 323 Network:
- [ ] Modificar `Login.vue` para detectar `source=american-dream`
- [ ] Pré-preencher formulário com dados da URL
- [ ] Modificar `auth.ts` para usar `admin.createUser()` quando `source=american-dream`
- [ ] Auto-confirmar email
- [ ] Redirecionar com token JWT

### American Dream:
- [ ] Modificar `LeadForm.tsx` para redirecionar para 323 Network
- [ ] Criar `AuthCallback.tsx` para receber token
- [ ] Adicionar rota `/auth/callback` no router
- [ ] Modificar `PaymentOptions.tsx` para verificar token (opcional)

---

## 🧪 Testes Necessários

1. ✅ Testar redirecionamento do American Dream para 323 Network
2. ✅ Testar pré-preenchimento do formulário
3. ✅ Testar criação de usuário com email confirmado
4. ✅ Testar redirecionamento de volta com token
5. ✅ Testar autenticação no callback
6. ✅ Testar vinculação de lead ao user_id
7. ✅ Testar fluxo completo end-to-end

---

**Última atualização**: 2026-01-02

