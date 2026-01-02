# ✅ Estratégia de SSO Sem Downtime - 323 Network & American Dream

## 🎯 Decisão: NÃO Mudar Legacy JWT Secret

### **Por quê?**
- ⚠️ Mudar Legacy JWT Secret causa **downtime significativo**
- ⚠️ **Usuários serão deslogados** forçadamente
- ⚠️ **Chaves API serão recriadas** (precisa atualizar código)
- ⚠️ **Mudança irreversível**
- ✅ **Alternativa melhor disponível**: Validação cruzada com Service Role Keys

---

## 🚀 Nova Estratégia: Validação Cruzada com Service Role Keys

### **Como Funciona:**
1. **Manter ambos os Legacy JWT Secrets diferentes** (como estão)
2. **Criar Edge Function** que valida tokens de ambos os projetos
3. **Usar Service Role Keys** para validar tokens
4. **Zero downtime** - não precisa mudar nada nos projetos

### **Vantagens:**
- ✅ **Zero downtime** - não afeta usuários
- ✅ **Usuários não são deslogados**
- ✅ **Não precisa mudar chaves API**
- ✅ **Reversível** - pode desfazer se necessário
- ✅ **Mais seguro** - usa Service Role Keys (melhor prática)
- ✅ **Recomendado pelo Supabase** - não usa Legacy Secret

---

## 🔧 Implementação Técnica

### **Arquitetura:**

```
┌─────────────────┐                    ┌──────────────────┐
│  323 Network    │                    │ American Dream   │
│                 │                    │                  │
│  User faz login │                    │  User quer       │
│  → Recebe token │                    │  acessar         │
└────────┬────────┘                    └────────┬─────────┘
         │                                       │
         │                                       │
         └───────────────┬───────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  Edge Function:               │
         │  validate-cross-project-token │
         │                               │
         │  - Valida token com           │
         │    Service Role Key do        │
         │    projeto de origem          │
         │  - Retorna dados do usuário   │
         └───────────────────────────────┘
```

---

### **Passo 1: Criar Edge Function no American Dream**

Criar função que valida tokens do 323 Network:

**Arquivo**: `supabase/functions/validate-323-network-token/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuração do 323 Network (projeto de origem)
const SUPABASE_323_NETWORK_URL = 'https://pgdvbanwumqjmqeybqnw.supabase.co'
const SUPABASE_323_NETWORK_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_323_NETWORK_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Criar cliente do 323 Network usando Service Role Key
    const supabase323 = createClient(
      SUPABASE_323_NETWORK_URL,
      SUPABASE_323_NETWORK_SERVICE_ROLE_KEY
    )
    
    // Validar token do 323 Network
    const { data: { user }, error } = await supabase323.auth.getUser(token)
    
    if (error || !user) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: error?.message || 'Invalid token' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    
    // Retornar dados do usuário
    return new Response(JSON.stringify({ 
      valid: true, 
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_confirmed_at !== null,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Validation error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Error validating token from 323 Network'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
```

---

### **Passo 2: Configurar Secret no American Dream**

No Dashboard do American Dream:
1. Settings > Edge Functions > Secrets
2. Adicionar novo secret:
   - **Nome**: `SUPABASE_323_NETWORK_SERVICE_ROLE_KEY`
   - **Valor**: `[REDACTED - Obter no Dashboard > Settings > API > Service Role Key]`

---

### **Passo 3: Deploy da Edge Function**

```bash
# No projeto American Dream
supabase functions deploy validate-323-network-token
```

---

### **Passo 4: Implementar no Frontend do American Dream**

Criar função de login com SSO:

```typescript
// No código do American Dream
async function loginWith323Network() {
  // 1. Redirecionar para 323 Network com callback URL
  const callbackUrl = encodeURIComponent(`${window.location.origin}/auth/callback`)
  window.location.href = `https://323network.com/login?redirect=${callbackUrl}`
}

// Na página de callback (/auth/callback)
async function handle323NetworkCallback(token: string) {
  // 2. Validar token usando Edge Function
  const response = await fetch(
    'https://xwgdvpicgsjeyqejanwa.supabase.co/functions/v1/validate-323-network-token',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
  
  const { valid, user } = await response.json()
  
  if (valid && user) {
    // 3. Criar sessão local no American Dream
    // Opção A: Criar usuário no auth.users se não existir
    // Opção B: Vincular lead existente ao user_id
    // Opção C: Criar sessão customizada
    
    // Exemplo: Vincular lead por email
    await linkLeadToUser(user.id, user.email)
    
    // 4. Redirecionar para dashboard
    window.location.href = '/dashboard'
  }
}
```

---

### **Passo 5: Criar Edge Function no 323 Network (Opcional)**

Se quiser que login no American Dream também funcione no 323 Network:

**Arquivo**: `supabase/functions/validate-american-dream-token/index.ts`

```typescript
// Similar à função anterior, mas validando tokens do American Dream
const SUPABASE_AMERICAN_DREAM_URL = 'https://xwgdvpicgsjeyqejanwa.supabase.co'
const SUPABASE_AMERICAN_DREAM_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_AMERICAN_DREAM_SERVICE_ROLE_KEY')!
```

---

## 📋 Checklist de Implementação

### **Fase 1: Preparação** ⏱️ 1 dia
- [ ] **CANCELAR** mudança de Legacy JWT Secret (não confirmar)
- [ ] Criar Edge Function `validate-323-network-token` no American Dream
- [ ] Adicionar secret `SUPABASE_323_NETWORK_SERVICE_ROLE_KEY` no American Dream
- [ ] Testar Edge Function localmente

### **Fase 2: Deploy** ⏱️ 1 dia
- [ ] Deploy da Edge Function no American Dream
- [ ] Testar validação de token do 323 Network
- [ ] Verificar logs e erros

### **Fase 3: Frontend** ⏱️ 2-3 dias
- [ ] Criar página de login com botão "Login com 323 Network"
- [ ] Implementar redirecionamento para 323 Network
- [ ] Criar página de callback
- [ ] Implementar lógica de vinculação de lead
- [ ] Criar sessão local após validação

### **Fase 4: Testes** ⏱️ 1-2 dias
- [ ] Testar fluxo completo de login
- [ ] Testar criação de novo usuário
- [ ] Testar vinculação de lead existente
- [ ] Testar token expirado
- [ ] Testar token inválido

---

## 🔄 Fluxo Completo de SSO

### **Cenário: Usuário quer acessar American Dream usando conta do 323 Network**

1. **Usuário acessa American Dream**
2. **Clica em "Login com 323 Network"**
3. **Redirecionado para 323 Network** (com callback URL)
4. **Faz login no 323 Network** (ou já está logado)
5. **323 Network redireciona de volta** com token JWT
6. **American Dream recebe token** na página de callback
7. **American Dream chama Edge Function** para validar token
8. **Edge Function valida token** usando Service Role Key do 323 Network
9. **Edge Function retorna dados do usuário**
10. **American Dream cria/vincula lead** ao `user_id`
11. **American Dream cria sessão local**
12. **Usuário acessa dashboard do American Dream**

---

## ⚠️ Pontos de Atenção

### **1. Vinculação de Leads:**
- Quando usuário faz login via SSO, verificar se já existe `lead` com esse email
- Se existir, vincular `user_id` ao `lead`
- Se não existir, criar novo `lead` ou permitir acesso sem lead

### **2. Sessão Local:**
- Após validar token, criar sessão no American Dream
- Pode usar Supabase Auth local ou sessão customizada
- Garantir que sessão expire junto com token

### **3. Segurança:**
- Service Role Keys devem ser mantidas em segredo
- Edge Function deve validar origem das requisições
- Implementar rate limiting

---

## 📊 Comparação: Mudar Secret vs Validação Cruzada

| Critério | Mudar Legacy Secret | Validação Cruzada (Recomendado) |
|----------|---------------------|--------------------------------|
| **Downtime** | ⚠️ Sim (significativo) | ✅ Não |
| **Usuários Deslogados** | ⚠️ Sim (todos ativos) | ✅ Não |
| **Chaves API** | ⚠️ Recriadas | ✅ Mantidas |
| **Complexidade** | ✅ Simples | ⚠️ Média |
| **Reversível** | ❌ Não | ✅ Sim |
| **Segurança** | ⚠️ Legacy | ✅ Moderna |
| **Recomendado** | ❌ Não | ✅ Sim |

---

## 🎯 Recomendação Final

### **⭐ CANCELAR mudança de Legacy JWT Secret**

**E usar validação cruzada com Service Role Keys:**
- ✅ Zero downtime
- ✅ Não afeta usuários
- ✅ Mais seguro
- ✅ Reversível
- ✅ Melhor prática

---

**Status**: ⏳ Aguardando decisão - Cancelar ou Confirmar mudança de secret

**Recomendação**: ⭐ **CANCELAR e usar validação cruzada**

