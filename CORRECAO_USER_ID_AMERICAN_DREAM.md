# 🔧 Correção Necessária: User ID no American Dream

**Data**: 2026-01-02  
**Status**: ⚠️ **AÇÃO NECESSÁRIA NO AMERICAN DREAM**  
**Prioridade**: 🔴 **ALTA**

---

## 🚨 Problema Identificado

A Edge Function `sync-american-dream-payment` está recebendo um `user_id` que **não corresponde** ao usuário no 323 Network.

### Exemplo do Erro:

```
❌ Error syncing payment to 323 Network: 
User not found in 323 Network: f1ccfdb0-8ac1-45d8-b5c8-a81b28a4677a
```

### Análise:

- **User ID enviado pelo American Dream**: `f1ccfdb0-8ac1-45d8-b5c8-a81b28a4677a`
- **User ID correto no 323 Network**: `ca792eb0-5ef6-4e9e-9667-7d7dae95d34e`
- **Email do usuário**: `givi4460@uorak.com`

**Causa**: O `user_id` do American Dream é diferente do `user_id` do 323 Network, mesmo sendo o mesmo usuário (mesmo email).

---

## ✅ Solução

Modificar o código do American Dream para **buscar o usuário correto no 323 Network pelo email** quando o `user_id` não corresponder.

### Opção 1: Buscar pelo Email (Recomendada)

Antes de chamar `syncPaymentTo323Network()`, buscar o usuário no 323 Network pelo email do lead:

```typescript
// No webhook handler do Stripe ou aprovação de Zelle
import { syncPaymentTo323Network } from '../utils/syncPaymentTo323Network.ts'

async function handleStripeWebhook(event: Stripe.Event) {
  if (event.type === 'checkout.session.completed' || 
      event.type === 'checkout.session.async_payment_succeeded') {
    
    const session = event.data.object as Stripe.Checkout.Session
    
    // 1. Obter dados do pagamento e lead
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, leads(*)')
      .eq('stripe_session_id', session.id)
      .single()
    
    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError)
      return
    }

    const lead = payment.leads
    
    // 2. Buscar usuário no 323 Network pelo EMAIL
    let userId323Network = lead?.user_id // Tentar usar o user_id do lead primeiro
    
    if (!userId323Network || !await userExistsIn323Network(userId323Network)) {
      // Se não tiver user_id ou não existir, buscar pelo email
      console.log(`User ID ${userId323Network} not found in 323 Network. Searching by email: ${lead.email}`)
      
      userId323Network = await findUserIn323NetworkByEmail(lead.email)
      
      if (!userId323Network) {
        console.warn(`User with email ${lead.email} not found in 323 Network - skipping sync`)
        return // Não sincronizar se não encontrar usuário
      }
      
      // Opcional: Atualizar o lead com o user_id correto para próximas vezes
      await supabase
        .from('leads')
        .update({ user_id: userId323Network })
        .eq('id', lead.id)
    }
    
    // 3. Sincronizar com o user_id correto
    try {
      await syncPaymentTo323Network({
        user_id: userId323Network, // ✅ User ID correto do 323 Network
        payment_id: payment.id,
        lead_id: lead.id,
        amount: payment.amount,
        currency: payment.currency || 'USD',
        payment_method: session.payment_method_types?.includes('pix') ? 'pix' : 'card',
        status: 'completed',
        stripe_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : (session.payment_intent as any)?.id,
        metadata: {
          american_dream_payment_id: payment.id,
          lead_id: lead.id,
          original_user_id: lead.user_id, // Manter referência ao user_id original
          found_by_email: lead.user_id !== userId323Network // Flag indicando que foi encontrado por email
        }
      })
    } catch (error) {
      console.error('Failed to sync payment to 323 Network:', error)
      // Não falhar o webhook - pagamento já foi processado
    }
  }
}
```

### Função Helper para Buscar Usuário no 323 Network

Criar função helper no American Dream:

```typescript
// utils/findUserIn323Network.ts

const SUPABASE_323_NETWORK_URL = Deno.env.get('SUPABASE_323_NETWORK_URL') || 
  'https://pgdvbanwumqjmqeybqnw.supabase.co'
const SUPABASE_323_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_323_SERVICE_ROLE_KEY')

/**
 * Verifica se um usuário existe no 323 Network pelo user_id
 */
export async function userExistsIn323Network(userId: string): Promise<boolean> {
  if (!SUPABASE_323_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_323_SERVICE_ROLE_KEY not configured')
    return false
  }

  try {
    const response = await fetch(
      `${SUPABASE_323_NETWORK_URL}/rest/v1/rpc/check_user_exists`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_323_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_323_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ user_id: userId })
      }
    )

    if (!response.ok) return false
    const result = await response.json()
    return result === true
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

/**
 * Busca usuário no 323 Network pelo email
 * Retorna o user_id se encontrado, null caso contrário
 */
export async function findUserIn323NetworkByEmail(email: string): Promise<string | null> {
  if (!SUPABASE_323_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_323_SERVICE_ROLE_KEY not configured')
    return null
  }

  try {
    // Buscar usuário pelo email usando a API do Supabase
    const response = await fetch(
      `${SUPABASE_323_NETWORK_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_323_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_323_SERVICE_ROLE_KEY}`
        }
      }
    )

    if (!response.ok) {
      console.error('Error fetching user by email:', response.statusText)
      return null
    }

    const users = await response.json()
    
    if (users && users.length > 0) {
      return users[0].id
    }

    return null
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}
```

### Alternativa Simples: Usar Admin API do Supabase

Se você já tem acesso ao Supabase do 323 Network, pode usar diretamente:

```typescript
// utils/findUserIn323Network.ts
import { createClient } from '@supabase/supabase-js'

const SUPABASE_323_NETWORK_URL = Deno.env.get('SUPABASE_323_NETWORK_URL') || 
  'https://pgdvbanwumqjmqeybqnw.supabase.co'
const SUPABASE_323_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_323_SERVICE_ROLE_KEY')

/**
 * Busca usuário no 323 Network pelo email usando Admin API
 */
export async function findUserIn323NetworkByEmail(email: string): Promise<string | null> {
  if (!SUPABASE_323_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_323_SERVICE_ROLE_KEY not configured')
    return null
  }

  try {
    const supabase323 = createClient(
      SUPABASE_323_NETWORK_URL,
      SUPABASE_323_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Buscar usuário pelo email usando Admin API
    const { data: { users }, error } = await supabase323.auth.admin.listUsers()
    
    if (error) {
      console.error('Error listing users:', error)
      return null
    }

    const user = users.find(u => u.email === email)
    return user?.id || null
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}
```

---

## 📋 Checklist de Implementação

- [ ] **1. Adicionar variável de ambiente**:
  - `SUPABASE_323_SERVICE_ROLE_KEY` (Service Role Key do 323 Network)

- [ ] **2. Criar função helper**:
  - `utils/findUserIn323Network.ts` com as funções acima

- [ ] **3. Atualizar webhook do Stripe**:
  - Adicionar verificação de `user_id` antes de sincronizar
  - Buscar por email se `user_id` não corresponder
  - Atualizar `lead.user_id` com o valor correto

- [ ] **4. Atualizar aprovação de Zelle**:
  - Mesma lógica de busca por email

- [ ] **5. Testar**:
  - Testar com usuário que tem `user_id` diferente
  - Verificar se encontra pelo email
  - Verificar se sincroniza corretamente

---

## 🔑 Variáveis de Ambiente Necessárias

No projeto American Dream, adicionar:

```bash
# URL do 323 Network (já deve ter)
SUPABASE_323_NETWORK_URL=https://pgdvbanwumqjmqeybqnw.supabase.co

# Service Role Key do 323 Network (NECESSÁRIO ADICIONAR)
SUPABASE_323_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Como obter `SUPABASE_323_SERVICE_ROLE_KEY`**:
1. Acesse: https://supabase.com/dashboard/project/pgdvbanwumqjmqeybqnw
2. Vá em: Settings > API
3. Copie a **Service Role Key** (role: `service_role`)
4. ⚠️ **CUIDADO**: Esta é uma chave sensível - nunca exponha no frontend

---

## 🎯 Fluxo Corrigido

```
1. Pagamento confirmado no American Dream
   ↓
2. Obter lead e payment do banco
   ↓
3. Verificar se lead.user_id existe no 323 Network
   ↓
4. Se NÃO existir:
   → Buscar usuário no 323 Network pelo email do lead
   → Atualizar lead.user_id com o user_id correto
   ↓
5. Chamar syncPaymentTo323Network() com user_id correto
   ↓
6. ✅ Pagamento sincronizado com sucesso
```

---

## ⚠️ Importante

- **Não falhar o webhook** se não encontrar o usuário - apenas logar e continuar
- **Atualizar `lead.user_id`** quando encontrar pelo email para evitar buscas futuras
- **Usar Service Role Key** apenas em Edge Functions (nunca no frontend)
- **Logar todas as buscas** para debug

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verificar logs da Edge Function no 323 Network
2. Verificar logs do webhook no American Dream
3. Verificar se `SUPABASE_323_SERVICE_ROLE_KEY` está configurada corretamente

---

**Última atualização**: 2026-01-02


