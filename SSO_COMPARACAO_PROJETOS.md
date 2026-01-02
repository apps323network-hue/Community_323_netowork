# 🔐 Comparação de Projetos - SSO 323 Network & American Dream

**Data**: 2026-01-02

---

## 📊 Resumo Executivo

### **Status de Coleta de Informações:**

| Item | 323 Network | American Dream |
|------|-------------|----------------|
| **Project ID** | ✅ `pgdvbanwumqjmqeybqnw` | ✅ `xwgdvpicgsjeyqejanwa` |
| **Project URL** | ✅ Coletado | ✅ Coletado |
| **Organization** | ✅ Coletado | ✅ Coletado |
| **Anon Key** | ✅ Coletado | ✅ Coletado |
| **Publishable Key** | ✅ Coletado | ✅ Coletado |
| **Service Role Key** | ✅ Coletado | ⚠️ Falta |
| **Legacy JWT Secret** | ✅ Coletado | ⚠️ **CRÍTICO - Falta** |
| **Estrutura de Dados** | ✅ Mapeada | ✅ Mapeada |
| **Edge Functions** | ✅ 5 funções | ✅ 15 funções |

---

## 🏢 Informações dos Projetos

### **323 Network**
- **Project ID**: `pgdvbanwumqjmqeybqnw`
- **Project URL**: `https://pgdvbanwumqjmqeybqnw.supabase.co`
- **Organization**: `323 network` (ID: `jkpjsvqezxvfjcwcyhin`)
- **Região**: `us-west-2`
- **Criado**: 2025-12-22
- **Status**: ACTIVE_HEALTHY

### **American Dream**
- **Project ID**: `xwgdvpicgsjeyqejanwa`
- **Project URL**: `https://xwgdvpicgsjeyqejanwa.supabase.co`
- **Organization**: `American Dream` (ID: `gvimpsiulkpduxkbvsjf`)
- **Região**: `us-west-1`
- **Criado**: 2025-10-31
- **Status**: ACTIVE_HEALTHY

---

## 🔑 Chaves de API

### **323 Network:**
- **Anon Key**: ✅ Coletada
- **Publishable Key**: ✅ `[REDACTED]`
- **Service Role Key**: ✅ Coletada
- **Legacy JWT Secret**: ✅ `[REDACTED - Obter no Dashboard]`
- **Access Token Expiry**: 3600 segundos (1 hora)

### **American Dream:**
- **Anon Key**: ✅ Coletada
- **Publishable Key**: ✅ `[REDACTED]`
- **Service Role Key**: ✅ Coletada
- **Legacy JWT Secret**: ✅ `[REDACTED - Obter no Dashboard]`
- **Access Token Expiry**: ✅ 3600 segundos (1 hora) - **IGUAL AO 323 NETWORK**

---

## 👥 Estrutura de Usuários

### **323 Network:**
- **Tabela Principal**: `profiles`
- **Total de Usuários**: 6
- **Estrutura**: 
  - Todos os usuários têm `profiles`
  - Vinculado a `auth.users.id`
  - Campos: nome, email, role, status, plano, etc.

### **American Dream:**
- **Tabela Principal**: `leads`
- **Total de Leads**: 29
- **Leads com user_id**: 6 (20.7%)
- **Leads sem user_id**: 23 (79.3%)
- **Estrutura**:
  - `leads` é a tabela principal
  - `user_id` é opcional (nullable)
  - Tabela `profiles` existe mas está vazia (0 registros)

### **⚠️ Diferenças Importantes:**

1. **Sistema de Dados Diferente:**
   - 323 Network: Foco em `profiles` (membros da comunidade)
   - American Dream: Foco em `leads` (clientes/leads do programa)

2. **Vinculação com Auth:**
   - 323 Network: Todos os usuários têm `profiles` vinculado
   - American Dream: Apenas 20.7% dos leads têm `user_id` vinculado

3. **Implicações para SSO:**
   - ✅ Ambos usam `auth.users.id` (compatível)
   - ⚠️ Estrutura de dados é diferente (não é problema para SSO)
   - ⚠️ No American Dream, pode ser necessário criar/vincular `user_id` quando usuário faz login via SSO

---

## 🔐 Legacy JWT Secret - Comparação

### **323 Network:**
```
[REDACTED - Obter no Dashboard > Settings > API > JWT Keys > Legacy JWT Secret]
```
- **Status**: Ainda em uso ("still used")
- **Access Token Expiry**: 3600 segundos (1 hora)

### **American Dream:**
- **Status**: ⚠️ **FALTA COLETAR**
- **Ação Necessária**: Acessar Dashboard > Settings > API > JWT Keys > Tab "Segredo do legado JWT"

### **Próximo Passo:**
1. Coletar Legacy JWT Secret do American Dream
2. Comparar com o do 323 Network
3. Se forem diferentes: Decidir qual usar ou gerar um novo compartilhado
4. Se forem iguais: Já estão prontos para SSO! ✅

---

## 📊 Estrutura de Dados Comparada

### **Tabelas Principais:**

| Tabela | 323 Network | American Dream | Uso |
|--------|-------------|----------------|-----|
| **profiles** | ✅ 6 registros | ⚠️ 0 registros | Perfis de usuários |
| **leads** | ❌ Não existe | ✅ 29 registros | Clientes/Leads |
| **payments** | ✅ 12 registros | ✅ 45 registros | Pagamentos |
| **events** | ✅ 2 registros | ❌ Não existe | Eventos |
| **posts** | ✅ 27 registros | ❌ Não existe | Posts/Conteúdo |
| **services** | ✅ 7 registros | ❌ Não existe | Serviços |
| **client_plans** | ❌ Não existe | ✅ 1 registro | Planos de clientes |
| **consultation_forms** | ❌ Não existe | ✅ 15 registros | Formulários |

### **Observações:**
- ✅ Estruturas são diferentes mas compatíveis para SSO
- ✅ Ambos usam `auth.users.id` como base
- ⚠️ Dados permanecem separados (como planejado)

---

## 🔧 Edge Functions Comparadas

### **323 Network:**
- **Total**: 5 funções
- **Principais**: `send-email`, `stripe-webhook`, `get-admin-emails`, etc.

### **American Dream:**
- **Total**: 15 funções
- **Principais**: `generate-contract-pdf`, `create-checkout-session`, `stripe-webhook`, `approve-payment-proof`, etc.

### **Observações:**
- ✅ Ambos têm integração com Stripe
- ✅ Funções específicas de cada sistema
- ⚠️ Para SSO, pode ser necessário criar novas Edge Functions para validação de token

---

## 🎯 Estratégia de SSO

### **Cenário 1: Legacy JWT Secrets São Diferentes** ✅ **CONFIRMADO**

**Status**: ✅ Secrets são diferentes
- 323 Network: `[REDACTED - Obter no Dashboard]`
- American Dream: `[REDACTED - Obter no Dashboard]`

**Decisão**: ✅ Usar JWT Secret do 323 Network (projeto principal)

**Ação:**
1. ✅ Escolhido: Usar secret do 323 Network
2. ⏳ Configurar American Dream para usar o mesmo secret
3. ⚠️ Planejar migração (pode invalidar tokens existentes - apenas 6 leads afetados)

### **Cenário 2: Legacy JWT Secrets São Iguais**

**Ação:**
1. ✅ Já estão configurados para SSO!
2. Implementar middleware de validação
3. Criar interface de login unificada

### **Cenário 3: American Dream Não Tem Legacy JWT Secret**

**Ação:**
1. Verificar se está usando apenas chaves ECC modernas
2. Considerar ativar Legacy JWT Secret
3. Ou implementar validação usando chaves ECC (mais complexo)

---

## 📝 Checklist Final

### **323 Network:**
- [x] Project ID ✅
- [x] Project URL ✅
- [x] Organization ID ✅
- [x] Anon Key ✅
- [x] Publishable Key ✅
- [x] Service Role Key ✅
- [x] Legacy JWT Secret ✅
- [x] Access Token Expiry ✅
- [x] Estrutura de dados ✅

### **American Dream:**
- [x] Project ID ✅
- [x] Project URL ✅
- [x] Organization ID ✅
- [x] Anon Key ✅
- [x] Publishable Key ✅
- [x] Service Role Key ✅
- [x] **Legacy JWT Secret** ✅ **COLETADO**
- [x] Access Token Expiry ✅ (3600 segundos - igual ao 323 Network)
- [x] Estrutura de dados ✅

---

## 🚀 Próximos Passos

### **1. Completar Informações do American Dream:**
- [ ] Coletar Legacy JWT Secret (Dashboard > Settings > API > JWT Keys)
- [ ] Coletar Service Role Key
- [ ] Verificar Access Token Expiry

### **2. Comparar e Decidir:**
- [ ] Comparar Legacy JWT Secrets
- [ ] Decidir estratégia (compartilhar secret ou gerar novo)
- [ ] Planejar migração (se necessário)

### **3. Implementar SSO:**
- [ ] Criar middleware de validação
- [ ] Implementar interface de login unificada
- [ ] Testar autenticação cruzada
- [ ] Implementar sincronização de dados básicos (se necessário)

---

**Status**: ⏳ Aguardando Legacy JWT Secret do American Dream para comparação e decisão de estratégia

