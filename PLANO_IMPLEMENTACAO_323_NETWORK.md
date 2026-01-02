# 🚀 Plano de Implementação: 323 Network

**Status**: 📋 Para implementação  
**Objetivo**: Implementar fluxo de registro integrado com American Dream

---

## 🎯 Objetivo

Quando um usuário vem do American Dream para se registrar na 323 Network:
1. Detectar origem (`source=american-dream`)
2. Pré-preencher formulário com dados da URL
3. Criar usuário com email já confirmado (sem precisar clicar no link)
4. Redirecionar de volta para American Dream com token JWT

---

## 📋 Tarefas Detalhadas

### 1. Detectar Origem e Pré-preencher Formulário ⚠️ CRÍTICO

**Arquivo**: `src/views/Login.vue`

**O que fazer**:
- Ler query parameters da URL: `source`, `returnTo`, `email`, `name`, `phone`, `phoneCountryCode`
- Se `source=american-dream`, pré-preencher campos do formulário
- Automaticamente ativar a aba de registro se vier do American Dream
- Passar `source` e `returnTo` para o `signUp`

**Código necessário**:
```typescript
// No setup() do Login.vue, após definir route
const route = useRoute()

// Ler query parameters
const source = route.query.source as string
const returnTo = route.query.returnTo as string
const prefillEmail = route.query.email as string
const prefillName = route.query.name as string
const prefillPhone = route.query.phone as string
const prefillCountryCode = route.query.phoneCountryCode as string || 'BR'

// Se veio do American Dream, ativar aba de registro e pré-preencher
if (source === 'american-dream') {
  activeTab.value = 'register'
  
  // Pré-preencher formulário
  if (prefillEmail) registerForm.value.email = prefillEmail
  if (prefillName) {
    const nameParts = prefillName.split(' ')
    registerForm.value.firstName = nameParts[0] || ''
    registerForm.value.lastName = nameParts.slice(1).join(' ') || ''
  }
  if (prefillPhone) registerForm.value.phone = prefillPhone
}

// Modificar handleRegister para passar source e returnTo
async function handleRegister() {
  loading.value = true
  try {
    const result = await authStore.signUp(
      registerForm.value.email,
      registerForm.value.password,
      {
        firstName: registerForm.value.firstName,
        lastName: registerForm.value.lastName,
        nome: `${registerForm.value.firstName} ${registerForm.value.lastName}`,
        phone: registerForm.value.phone || null,
        source: source || '323-network', // ✅ Passar source
        returnTo: returnTo || null, // ✅ Passar returnTo
        phoneCountryCode: prefillCountryCode || 'BR'
      }
    )
    // ... resto do código
  } catch (error) {
    // ... tratamento de erro
  } finally {
    loading.value = false
  }
}
```

**Checklist**:
- [ ] Adicionar leitura de query parameters no setup()
- [ ] Adicionar lógica para ativar aba de registro se `source=american-dream`
- [ ] Adicionar pré-preenchimento de campos
- [ ] Modificar `handleRegister` para passar `source` e `returnTo`
- [ ] Testar pré-preenchimento

---

### 2. Auto-confirmar Email e Redirecionar ⚠️ CRÍTICO

**Arquivo**: `src/stores/auth.ts`

**O que fazer**:
- Se `source === 'american-dream'`, usar `admin.createUser()` ao invés de `auth.signUp()`
- Criar usuário com `email_confirm: true` (email já confirmado)
- Obter token de sessão após criação
- Redirecionar para `{returnTo}?token={JWT_TOKEN}`

**Código necessário**:
```typescript
async function signUp(email: string, password: string, userData?: Record<string, any>) {
  loading.value = true
  error.value = null
  try {
    // ✅ NOVO: Se veio do American Dream, usar Edge Function para confirmar email automaticamente
    if (userData?.source === 'american-dream') {
      console.log('[SSO] ============================================')
      console.log('[SSO] REGISTRO VINDO DO AMERICAN DREAM')
      console.log('[SSO] ============================================')
      console.log('[SSO] Criando usuário com email já confirmado...')
      
      // Chamar Edge Function para criar usuário com email confirmado
      const { data: result, error: invokeError } = await supabase.functions.invoke('create-user-confirmed', {
        body: {
          email,
          password,
          user_metadata: {
            ...userData,
            source: 'american-dream',
            phoneCountryCode: userData?.phoneCountryCode || 'BR',
            nome: userData.nome || `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
          }
        }
      })
      
      if (invokeError) {
        console.error('[SSO] ❌ Erro ao chamar Edge Function:', invokeError)
        throw invokeError
      }
      
      if (!result?.success || !result?.user) {
        throw new Error('Falha ao criar usuário')
      }
      
      user.value = result.user
      
      console.log('[SSO] ✅ Usuário criado com email confirmado:', result.user.id)
      
      // Se a Edge Function retornou token, usar ele
      // Se não, fazer sign in para obter token
      let accessToken = result.access_token
      
      if (!accessToken) {
        // Fazer sign in para obter token
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (signInError) {
          console.error('[SSO] ❌ Erro ao fazer sign in:', signInError)
          throw signInError
        }
        
        accessToken = signInData.session?.access_token
      }
      
      if (!accessToken) {
        throw new Error('Falha ao obter token de sessão')
      }
      
      console.log('[SSO] ✅ Token obtido, redirecionando para American Dream...')
      
      // Se tiver returnTo, redirecionar com token
      if (userData?.returnTo && accessToken) {
        const returnUrl = new URL(userData.returnTo)
        returnUrl.searchParams.set('token', accessToken)
        returnUrl.searchParams.set('email', email)
        returnUrl.searchParams.set('name', userData.nome || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || email.split('@')[0])
        if (userData.phone) returnUrl.searchParams.set('phone', userData.phone)
        if (userData.phoneCountryCode) returnUrl.searchParams.set('phoneCountryCode', userData.phoneCountryCode)
        
        console.log('[SSO] Redirecionando para:', returnUrl.toString())
        window.location.href = returnUrl.toString()
        return { success: true, redirected: true }
      }
      
      return { success: true }
    }
    
    // ✅ Fluxo normal (não veio do American Dream)
    console.log('[SSO] Registro normal (não veio do American Dream)')
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    
    if (authError) throw authError
    user.value = data.user
    
    // ... resto do código normal (sincronização com American Dream, notificação de admins, etc.)
    
    return { success: true }
  } catch (err: any) {
    error.value = err.message
    return { success: false, error: err.message }
  } finally {
    loading.value = false
  }
}
```

**Checklist**:
- [ ] Adicionar verificação `if (userData?.source === 'american-dream')`
- [ ] Implementar criação com `admin.createUser()` e `email_confirm: true`
- [ ] Obter token de sessão após criação
- [ ] Implementar redirecionamento com token
- [ ] Adicionar logs detalhados
- [ ] Manter fluxo normal para registros que não vêm do American Dream
- [ ] Testar criação de usuário com email confirmado
- [ ] Testar redirecionamento

---

### 3. Criar Edge Function para Criar Usuário com Email Confirmado ⚠️ CRÍTICO

**Arquivo**: `supabase/functions/create-user-confirmed/index.ts` (NOVO)

**Por que**: O frontend não tem acesso à Service Role Key (apenas Anon Key). Precisamos de uma Edge Function para usar `admin.createUser()`.

**O que fazer**:
- Criar Edge Function que recebe email, password e user_metadata
- Usar `admin.createUser()` com `email_confirm: true`
- Retornar dados do usuário e token de sessão

**Código necessário**:
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { email, password, user_metadata } = body

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e password são obrigatórios' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Obter Service Role Key do ambiente (disponível automaticamente nas Edge Functions)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    // Criar cliente Supabase Admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Criar usuário com email já confirmado
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ✅ Email já confirmado
      user_metadata: user_metadata || {},
    })

    if (createUserError) {
      throw createUserError
    }

    if (!newUser.user) {
      throw new Error('Falha ao criar usuário')
    }

    // Fazer sign in para obter token de sessão
    // Usar cliente anon para criar sessão válida para o frontend
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseAnonKey) {
      throw new Error('Missing SUPABASE_ANON_KEY')
    }

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: { session }, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !session) {
      console.warn('Não foi possível criar sessão automaticamente, mas usuário foi criado')
      console.warn('Erro:', signInError?.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: newUser.user,
        session: session || null,
        access_token: session?.access_token || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro desconhecido',
        stack: error.stack,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
```

**Checklist**:
- [ ] Criar arquivo `supabase/functions/create-user-confirmed/index.ts`
- [ ] Implementar lógica de criação de usuário
- [ ] Implementar geração de token de sessão
- [ ] Fazer deploy da Edge Function
- [ ] Testar criação de usuário

---

## 📊 Resumo das Tarefas

| Tarefa | Arquivo | Prioridade | Complexidade | Tempo Estimado |
|--------|---------|-----------|--------------|----------------|
| 1. Detectar origem e pré-preencher | `Login.vue` | 🔴 Crítica | Média | 45min |
| 2. Criar Edge Function | `supabase/functions/create-user-confirmed/index.ts` | 🔴 Crítica | Alta | 1h |
| 3. Auto-confirmar email e redirecionar | `auth.ts` | 🔴 Crítica | Alta | 1h30min |

**Tempo total estimado**: ~3h15min

---

## 🧪 Testes Necessários

### Teste 1: Detecção de Origem
- [ ] Acessar `https://323network.com/login?source=american-dream&email=test@example.com&name=Test User&phone=+5511999999999`
- [ ] Verificar se aba de registro é ativada automaticamente
- [ ] Verificar se campos são pré-preenchidos

### Teste 2: Criação com Email Confirmado
- [ ] Preencher formulário e submeter
- [ ] Verificar se usuário é criado com `email_confirm: true`
- [ ] Verificar se não precisa confirmar email

### Teste 3: Redirecionamento
- [ ] Verificar se redireciona para URL do `returnTo`
- [ ] Verificar se token JWT está na URL
- [ ] Verificar se dados do usuário estão na URL

### Teste 4: Fluxo Completo
- [ ] Fazer registro completo (American Dream → 323 Network → American Dream)
- [ ] Verificar se usuário está autenticado no final
- [ ] Verificar se sincronização com American Dream funcionou

---

## ⚠️ Pontos de Atenção

1. **Service Role Key**: 
   - `admin.createUser()` requer Service Role Key
   - Se não estiver disponível no frontend, criar Edge Function

2. **Sincronização com American Dream**:
   - Quando `source=american-dream`, NÃO sincronizar de volta (evitar loop)
   - A Edge Function `sync-user-to-american-dream` já cria o usuário no American Dream

3. **Notificação de Admins**:
   - Manter lógica de notificação mesmo para usuários do American Dream
   - Pode ser útil para rastreamento

4. **Error Handling**:
   - Garantir tratamento de erros em todos os pontos
   - Se redirecionamento falhar, mostrar erro ao usuário

5. **URLs**:
   - ✅ URL de produção: `https://323network.com/`
   - ✅ URL de login/registro: `https://323network.com/login?redirect=/`
   - ✅ URL do American Dream: `https://americandream.323network.com/`

---

## 📝 Notas Técnicas

### Por Que Usar `admin.createUser()`?

- Permite criar usuário com `email_confirm: true`
- Não envia email de confirmação
- Usuário pode usar o sistema imediatamente

### Alternativa: Edge Function

Se Service Role Key não estiver disponível no frontend:

```typescript
// Criar Edge Function: create-user-with-confirmed-email
// Chamar do frontend:
const { data, error } = await supabase.functions.invoke('create-user-with-confirmed-email', {
  body: {
    email,
    password,
    user_metadata: userData
  }
})
```

---

## 🚀 Próximos Passos

1. ✅ Implementar detecção de origem no `Login.vue`
2. ✅ Implementar pré-preenchimento de formulário
3. ✅ Implementar criação com email confirmado no `auth.ts`
4. ✅ Implementar redirecionamento com token
5. ✅ Testar fluxo completo

---

**Última atualização**: 2026-01-02

