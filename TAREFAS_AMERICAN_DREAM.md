# ✅ Tarefas para Implementar no American Dream

**Status**: 📋 Para implementação em paralelo  
**Baseado em**: Informações coletadas do código

---

## 🌐 URLs e Informações da 323 Network

**URL de produção**: `https://323network.com/`  
**URL de login/registro**: `https://323network.com/login?redirect=/`  
**URL de registro (com parâmetros)**: `https://323network.com/login?source=american-dream&returnTo=[URL]&email=[EMAIL]&name=[NAME]&phone=[PHONE]&phoneCountryCode=[CODE]`

**Nota**: A 323 Network usa a mesma rota `/login` para login e registro (com toggle entre os dois).

---

## 🎯 Objetivo

Modificar o fluxo de registro para redirecionar para 323 Network e receber o usuário autenticado de volta.

---

## 📋 Tarefas Detalhadas

### 1. Modificar LeadForm.tsx ⚠️ CRÍTICO

**Arquivo**: `src/pages/LeadForm.tsx`

**O que fazer**:
- Modificar a função `handleSubmit` para redirecionar para 323 Network ao invés de criar lead diretamente
- Passar dados do formulário via query parameters na URL

**Código a modificar**:
```typescript
// LOCALIZAR: função handleSubmit no LeadForm.tsx
// SUBSTITUIR: lógica de criação de lead por redirecionamento

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Validar formulário (manter validação existente)
  // Formatar telefone (manter formatação existente)
  
  // ✅ NOVO: Redirecionar para 323 Network ao invés de criar lead
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

**Checklist**:
- [ ] Localizar função `handleSubmit` no arquivo
- [ ] Remover código de inserção na tabela `leads`
- [ ] Remover código de criação de `term_acceptance`
- [ ] Adicionar redirecionamento para 323 Network
- [ ] Manter validação e formatação de telefone
- [ ] Testar redirecionamento

---

### 2. Criar AuthCallback.tsx ⚠️ CRÍTICO

**Arquivo**: `src/pages/AuthCallback.tsx` (NOVO)

**O que fazer**:
- Criar novo componente para receber token JWT da 323 Network
- Autenticar usuário usando `supabase.auth.setSession()`
- Buscar ou criar lead vinculado ao `user_id`
- Redirecionar para `/payment-options`

**Código completo**:
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
        // 1. Autenticar usuário com o token
        const { data: { session }, error: authError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: '' // Supabase vai gerenciar
        })
        
        if (authError) throw authError
        if (!session?.user) throw new Error('Falha ao autenticar usuário')
        
        // 2. Buscar lead existente pelo email
        const { data: existingLead, error: leadError } = await supabase
          .from('leads')
          .select('id, user_id, term_acceptance_id')
          .eq('email', session.user.email!)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        let leadId = existingLead?.id
        let termAcceptanceId = existingLead?.term_acceptance_id
        
        // 3. Se lead não existe, criar novo vinculado ao user_id
        if (!existingLead || leadError) {
          // Criar lead vinculado ao usuário
          const { data: newLead, error: createError } = await supabase
            .from('leads')
            .insert({
              name: name || session.user.user_metadata.nome || session.user.email!.split('@')[0],
              email: session.user.email!,
              phone: session.user.user_metadata.phone || '',
              country_code: session.user.user_metadata.phoneCountryCode || null,
              user_id: session.user.id, // ✅ Vincular ao user_id
              status_geral: 'novo'
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Erro ao criar lead:', createError)
            // Continuar mesmo assim
          } else {
            leadId = newLead.id
            
            // Criar term_acceptance se necessário
            // (ajustar conforme lógica do sistema)
          }
        } else if (existingLead && !existingLead.user_id) {
          // 4. Vincular lead existente ao user_id
          const { error: updateError } = await supabase
            .from('leads')
            .update({ user_id: session.user.id })
            .eq('id', existingLead.id)
          
          if (updateError) {
            console.error('Erro ao vincular lead:', updateError)
          }
        }
        
        // 5. Redirecionar para payment-options
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
        <p className="text-gray-600">Por favor, aguarde enquanto configuramos sua sessão.</p>
      </div>
    </div>
  )
}
```

**Checklist**:
- [ ] Criar arquivo `src/pages/AuthCallback.tsx`
- [ ] Implementar lógica de autenticação
- [ ] Implementar busca/criação de lead
- [ ] Implementar vinculação de lead ao user_id
- [ ] Implementar redirecionamento
- [ ] Adicionar tratamento de erros
- [ ] Adicionar loading state

---

### 3. Adicionar Rota no Router ⚠️ CRÍTICO

**Arquivo**: `src/router/index.tsx` ou arquivo de rotas principal

**O que fazer**:
- Adicionar rota `/auth/callback` apontando para o componente `AuthCallback`

**Código necessário**:
```typescript
import AuthCallback from '@/pages/AuthCallback'

// Adicionar na lista de rotas
{
  path: '/auth/callback',
  element: <AuthCallback />
}
```

**Checklist**:
- [ ] Localizar arquivo de rotas
- [ ] Importar componente `AuthCallback`
- [ ] Adicionar rota `/auth/callback`
- [ ] Testar rota

---

### 4. Modificar PaymentOptions.tsx (Opcional mas Recomendado)

**Arquivo**: `src/pages/PaymentOptions.tsx`

**O que fazer**:
- Verificar se há token na URL quando a página carrega
- Se houver token, autenticar antes de mostrar a página
- Vincular lead ao `user_id` se ainda não estiver vinculado

**Código necessário**:
```typescript
// Adicionar no início do componente PaymentOptions
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

**Checklist**:
- [ ] Localizar componente `PaymentOptions`
- [ ] Adicionar `useEffect` para verificar token
- [ ] Implementar autenticação se token existir
- [ ] Implementar vinculação de lead
- [ ] Remover token da URL após processar
- [ ] Testar

---

### 5. Atualizar Service Role Key (Se Ainda Não Fez) ⚠️ IMPORTANTE

**Onde**: Dashboard do Supabase > Edge Functions > Secrets

**O que fazer**:
- Atualizar `SUPABASE_SERVICE_ROLE_KEY` com a nova chave (gerada após mudança do JWT Secret)
- Verificar todas as Edge Functions que usam Service Role Key

**Edge Functions que precisam atualização**:
1. `stripe-webhook`
2. `create-checkout-session`
3. `verify-stripe-session`
4. `update-payment`
5. `generate-consultation-link-for-lead`
6. `generate-consultation-link-with-acceptance`
7. `generate-consultation-link`
8. `approve-payment-proof`
9. `check-pix-payment`
10. `create-payment-for-proof`
11. `generate-contract-pdf`

**Checklist**:
- [ ] Obter nova Service Role Key do Dashboard
- [ ] Atualizar secrets de todas as Edge Functions
- [ ] Testar Edge Functions críticas (pagamentos)

---

## 📊 Resumo das Tarefas

| Tarefa | Prioridade | Complexidade | Tempo Estimado |
|--------|-----------|--------------|----------------|
| 1. Modificar LeadForm.tsx | 🔴 Crítica | Média | 30min |
| 2. Criar AuthCallback.tsx | 🔴 Crítica | Alta | 1h |
| 3. Adicionar rota /auth/callback | 🔴 Crítica | Baixa | 10min |
| 4. Modificar PaymentOptions.tsx | 🟡 Opcional | Média | 30min |
| 5. Atualizar Service Role Key | 🟡 Importante | Baixa | 15min |

**Tempo total estimado**: ~2h30min

---

## 🧪 Testes Necessários

### Teste 1: Redirecionamento
- [ ] Preencher formulário no `/lead-form`
- [ ] Verificar se redireciona para 323 Network com parâmetros corretos
- [ ] Verificar se dados estão na URL

### Teste 2: Callback
- [ ] Acessar `/auth/callback?token=[JWT_TOKEN]&email=[EMAIL]&name=[NAME]`
- [ ] Verificar se usuário é autenticado
- [ ] Verificar se lead é criado/vinculado
- [ ] Verificar se redireciona para `/payment-options`

### Teste 3: Fluxo Completo
- [ ] Fazer registro completo (American Dream → 323 Network → American Dream)
- [ ] Verificar se usuário está autenticado no final
- [ ] Verificar se lead está vinculado ao `user_id`
- [ ] Verificar se página de pagamento carrega corretamente

---

## ⚠️ Pontos de Atenção

1. **Term Acceptance**: Verificar se precisa criar `term_acceptance` no callback ou se já existe lógica para isso

2. **Country Detection**: Manter lógica de detecção de país se necessário

3. **Error Handling**: Garantir tratamento de erros em todos os pontos

4. **Loading States**: Adicionar indicadores de carregamento onde necessário

5. **URLs**: 
   - ✅ URL de produção da 323 Network: `https://323network.com/`
   - ✅ URL de login/registro: `https://323network.com/login?redirect=/`
   - ✅ Usar `/login` (não `/register`) pois é a mesma rota com toggle entre login/registro

---

## 📝 Notas

- O fluxo atual cria lead sem usuário autenticado
- O novo fluxo cria usuário primeiro e depois vincula/cria lead
- Isso permite rastreamento melhor e autenticação unificada

---

**Última atualização**: 2026-01-02

