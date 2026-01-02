# ⚠️ Análise de Riscos - Mudança de Legacy JWT Secret

## 🚨 Avisos do Supabase

Ao tentar mudar o Legacy JWT Secret do American Dream, o Supabase mostra avisos críticos:

### **1. Downtime Significativo**
- ⚠️ Aplicação terá downtime durante a troca
- ⚠️ Novas chaves `anon` e `service_role` serão criadas
- ⚠️ Chaves antigas serão **permanentemente destruídas**
- ⚠️ Aplicação para de funcionar durante a troca
- ⚠️ Apps mobile/desktop podem ter downtime maior (depende de atualizações)

### **2. Usuários Serão Deslogados**
- ⚠️ Usuários ativos serão **forçadamente deslogados**
- ⚠️ Usuários inativos mantêm sessões
- ⚠️ URLs pré-assinadas do Storage serão invalidadas

### **3. Reinicialização do Projeto**
- ⚠️ Projeto e database serão **reiniciados**
- ⚠️ Conexões existentes serão terminadas
- ⚠️ Pode haver erros de API por até 2 minutos

### **4. Período de Cooldown**
- ⚠️ 20 minutos de espera antes de poder reverter ou repetir

### **5. Mudança Irreversível**
- ⚠️ Secret antigo será **permanentemente perdido**
- ⚠️ Mesmo reusando o secret antigo, as chaves `anon` e `service_role` não serão restauradas

---

## 🤔 Reavaliação da Estratégia

### **Impacto Real:**

#### **American Dream:**
- **29 leads** no total
- **6 leads** com `user_id` vinculado (20.7%)
- **23 leads** sem `user_id` (79.3%)
- **Impacto**: Apenas 6 usuários ativos seriam afetados

#### **Riscos:**
- ⚠️ Downtime durante a mudança
- ⚠️ Usuários ativos serão deslogados
- ⚠️ Chaves API serão recriadas (precisa atualizar código/configurações)
- ⚠️ URLs pré-assinadas do Storage invalidadas

---

## 🎯 Alternativas de Implementação

### **Opção 1: Aceitar Downtime e Mudar Secret** ⚠️

**Vantagens:**
- ✅ Solução mais simples tecnicamente
- ✅ SSO funcionará nativamente
- ✅ Uma vez feito, está feito

**Desvantagens:**
- ⚠️ Downtime durante mudança
- ⚠️ Usuários deslogados
- ⚠️ Precisa atualizar chaves API no código
- ⚠️ Mudança irreversível

**Quando usar:**
- Se o downtime for aceitável
- Se houver janela de manutenção
- Se o impacto for baixo (6 usuários)

---

### **Opção 2: Usar JWT Signing Keys Modernas (ECC)** ⭐ **RECOMENDADO**

**Como Funciona:**
- Não mudar o Legacy JWT Secret
- Usar as chaves ECC modernas de ambos os projetos
- Criar serviço de validação que aceita tokens de ambos

**Vantagens:**
- ✅ **Zero downtime**
- ✅ Usuários não são deslogados
- ✅ Não precisa mudar chaves API
- ✅ Reversível
- ✅ Mais seguro (chaves modernas)

**Desvantagens:**
- ⚠️ Implementação mais complexa
- ⚠️ Requer Edge Function para validação cruzada

**Implementação:**
1. Criar Edge Function que valida tokens de ambos os projetos
2. Usar Service Role Keys para validar tokens
3. Não mudar Legacy JWT Secrets

---

### **Opção 3: Validação Híbrida**

**Como Funciona:**
- Manter ambos os secrets diferentes
- Criar middleware que tenta validar com ambos os secrets
- Se um falhar, tenta o outro

**Vantagens:**
- ✅ Zero downtime
- ✅ Não precisa mudar nada
- ✅ Funciona imediatamente

**Desvantagens:**
- ⚠️ Mais complexo de implementar
- ⚠️ Requer lógica de fallback

---

## 🎯 Recomendação Atualizada: Opção 2 (JWT Signing Keys Modernas)

### **Por quê?**

1. **Zero Downtime**: Não afeta usuários ativos
2. **Mais Seguro**: Usa chaves ECC modernas
3. **Reversível**: Pode desfazer se necessário
4. **Melhor Prática**: Supabase recomenda usar JWT Signing Keys ao invés de Legacy

### **Implementação:**

#### **1. Criar Edge Function de Validação Compartilhada**

```typescript
// supabase/functions/validate-cross-project-token/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configurações dos dois projetos
const PROJECT_323_NETWORK = {
  url: 'https://pgdvbanwumqjmqeybqnw.supabase.co',
  serviceRoleKey: Deno.env.get('SUPABASE_323_NETWORK_SERVICE_ROLE_KEY')!,
}

const PROJECT_AMERICAN_DREAM = {
  url: 'https://xwgdvpicgsjeyqejanwa.supabase.co',
  serviceRoleKey: Deno.env.get('SUPABASE_AMERICAN_DREAM_SERVICE_ROLE_KEY')!,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, targetProject } = await req.json()
    
    // Determinar qual projeto validar
    let supabase
    if (targetProject === '323-network') {
      supabase = createClient(PROJECT_323_NETWORK.url, PROJECT_323_NETWORK.serviceRoleKey)
    } else {
      supabase = createClient(PROJECT_AMERICAN_DREAM.url, PROJECT_AMERICAN_DREAM.serviceRoleKey)
    }
    
    // Validar token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return new Response(JSON.stringify({ valid: false, error: error?.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    
    return new Response(JSON.stringify({ 
      valid: true, 
      user: {
        id: user.id,
        email: user.email,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
```

#### **2. Configurar Secrets nas Edge Functions**

No Supabase Dashboard, adicionar:
- `SUPABASE_323_NETWORK_SERVICE_ROLE_KEY`
- `SUPABASE_AMERICAN_DREAM_SERVICE_ROLE_KEY`

---

## 📊 Comparação de Opções

| Critério | Opção 1: Mudar Secret | Opção 2: ECC Keys | Opção 3: Híbrida |
|----------|----------------------|-------------------|------------------|
| **Downtime** | ⚠️ Sim | ✅ Não | ✅ Não |
| **Usuários Deslogados** | ⚠️ Sim | ✅ Não | ✅ Não |
| **Complexidade** | ✅ Simples | ⚠️ Média | ⚠️ Alta |
| **Reversível** | ❌ Não | ✅ Sim | ✅ Sim |
| **Segurança** | ⚠️ Legacy | ✅ Moderna | ⚠️ Legacy |
| **Recomendado pelo Supabase** | ❌ Não | ✅ Sim | ❌ Não |

---

## 🎯 Decisão Final

### **Recomendação: Opção 2 (JWT Signing Keys Modernas)**

**Razões:**
1. ✅ Zero downtime
2. ✅ Não afeta usuários
3. ✅ Mais seguro
4. ✅ Reversível
5. ✅ Recomendado pelo Supabase

### **Se Preferir Opção 1 (Mudar Secret):**

**Quando fazer:**
- ✅ Se houver janela de manutenção
- ✅ Se o downtime for aceitável
- ✅ Se quiser solução mais simples

**Checklist antes de confirmar:**
- [ ] Backup de dados
- [ ] Avisar usuários (se necessário)
- [ ] Preparar para atualizar chaves API no código
- [ ] Ter janela de manutenção disponível
- [ ] Ter plano de rollback

---

## 📝 Próximos Passos

### **Se escolher Opção 2 (Recomendado):**
1. [ ] Cancelar a mudança de secret (não confirmar)
2. [ ] Criar Edge Function de validação cruzada
3. [ ] Configurar Service Role Keys como secrets
4. [ ] Implementar middleware de validação
5. [ ] Testar SSO

### **Se escolher Opção 1:**
1. [ ] Confirmar mudança (digite "I understand and wish to proceed")
2. [ ] Aguardar reinicialização (até 2 minutos)
3. [ ] Atualizar chaves API no código
4. [ ] Testar autenticação
5. [ ] Implementar SSO

---

**Minha Recomendação**: ⭐ **CANCELAR e usar Opção 2 (JWT Signing Keys Modernas)**

**Por quê?** Zero downtime, mais seguro, e não afeta usuários. A implementação é um pouco mais complexa, mas vale a pena.

