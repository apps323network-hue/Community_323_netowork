# 📊 Informações do Projeto American Dream - Supabase

**Data de Coleta**: 2026-01-02  
**Método**: MCP Supabase API

---

## 🏢 Informações do Projeto

### **Identificação**
- **Project ID (ref)**: `xwgdvpicgsjeyqejanwa`
- **Nome**: `appsamericandream@gmail.com's Project`
- **Status**: `ACTIVE_HEALTHY`
- **Região**: `us-west-1`
- **Criado em**: `2025-10-31T07:19:18.669168Z`

### **Organização**
- **Organization ID**: `gvimpsiulkpduxkbvsjf`
- **Organization Slug**: `gvimpsiulkpduxkbvsjf`
- **Organization Name**: `American Dream`
- **Plan**: `free`
- **Allowed Release Channels**: `ga`, `preview`

### **URLs e Endpoints**
- **Project URL**: `https://xwgdvpicgsjeyqejanwa.supabase.co`
- **Database Host**: `db.xwgdvpicgsjeyqejanwa.supabase.co`
- **Database Version**: `17.6.1.032`
- **Postgres Engine**: `17`
- **Release Channel**: `ga`

---

## 🔑 Chaves de API

### **Anon Key (Chave Pública)**
```
[REDACTED - Obter no Dashboard > Settings > API > Anon Key]
```
- **Tipo**: Legacy anon API key
- **Status**: Ativa (não desabilitada)
- **Descrição**: Legacy anon API key

### **Publishable Key (Chave Moderna)**
```
[REDACTED - Obter no Dashboard > Settings > API > Publishable Key]
```
- **Tipo**: Publishable key
- **Status**: Ativa (não desabilitada)
- **ID**: `8b7ffcaf-b089-4ed1-b03f-13d70aa059e1`

### **Service Role Key**
- **Status**: ✅ COLETADA (ATUALIZADA após mudança do JWT Secret)
- **Localização**: Supabase Dashboard > Settings > API > Service Role Key
- **⚠️ SEGREDO CRÍTICO**: Esta chave deve ser mantida em segredo e nunca exposta no frontend
- **⚠️ NUNCA commitar no código**: Usar apenas em variáveis de ambiente server-side
- **Key (NOVA - gerada em 02/01/2026)**: `[REDACTED - Obter no Dashboard > Settings > API > Service Role Key]`
- **⚠️ IMPORTANTE**: Esta é a NOVA chave gerada após mudar o JWT Secret para o mesmo do 323 Network
- **Uso**: Validação server-side de tokens, operações administrativas

### **JWT Secret e Chaves de Assinatura**

#### **Legacy JWT Secret (HS256):** ✅ COLETADO
- **Status**: ✅ **EM USO** ("Used to sign and verify JWTs issued by Supabase Auth")
- **Secret**: `[REDACTED - Obter no Dashboard > Settings > API > JWT Keys > Legacy JWT Secret]`
- **Tipo**: HS256 (Shared Secret)
- **⚠️ CRÍTICO PARA SSO**: Esta é a chave que será compartilhada com o 323 Network
- **Access Token Expiry**: 3600 segundos (1 hora) ✅ **IGUAL AO 323 NETWORK**
- **Uso**: Usado para assinar e verificar JWTs emitidos pelo Supabase Auth

---

## 👥 Estrutura de Usuários

### **Sistema de Usuários**

O American Dream usa um sistema diferente do 323 Network:

#### **Tabela `leads` (Principal)**
- **Total de Leads**: 29 registros
- **Leads com user_id**: 6 (vinculados a auth.users)
- **Leads sem user_id**: 23 (não vinculados ainda)
- **Vinculação**: `user_id` → `auth.users.id` (opcional - pode ser NULL)
- **⚠️ IMPORTANTE PARA SSO**: Apenas 6 de 29 leads têm `user_id` vinculado

#### **Tabela `profiles` (Opcional)**
- **Total de Profiles**: 0 registros (tabela existe mas está vazia)
- **Estrutura**: Similar ao 323 Network, mas não está sendo usada ativamente
- **Vinculação**: `id` → `auth.users.id`

### **Diferenças em Relação ao 323 Network:**

1. **Sistema Principal**: 
   - 323 Network: Usa `profiles` como tabela principal
   - American Dream: Usa `leads` como tabela principal

2. **Estrutura de Dados**:
   - 323 Network: Foco em perfis de membros da comunidade
   - American Dream: Foco em leads/clientes do programa de mentoria

3. **Autenticação**:
   - 323 Network: Todos os usuários têm `profiles`
   - American Dream: Leads podem ter `user_id` (opcional)

---

## 📊 Estrutura do Banco de Dados

### **Tabelas Principais Identificadas:**

#### **1. `leads`** (Principal - Clientes/Leads)
- **29 registros**
- **RLS**: Desabilitado
- **Leads com user_id**: 6 (20.7%)
- **Leads sem user_id**: 23 (79.3%)
- **Campos principais**:
  - `id` (uuid, PK)
  - `name` (text, NOT NULL)
  - `email` (text, NOT NULL)
  - `phone` (text, NOT NULL)
  - `country_code` (text, nullable)
  - `user_id` (uuid, FK → auth.users.id, nullable)
  - `status_geral` (text, nullable)
  - `created_at` (timestamptz, default: now())
  - `updated_at` (timestamptz, default: now())

#### **2. `profiles`** (Perfis de Usuários)
- **0 registros** (tabela existe mas não está sendo usada)
- **RLS**: Desabilitado
- **Estrutura**: Similar ao 323 Network
- **Vinculação**: `id` → `auth.users.id`

#### **3. `consultation_forms`** (Formulários de Consultoria)
- **15 registros**
- **RLS**: Desabilitado
- **Campos**: Dados completos do formulário de análise prévia
- **Vinculação**: `lead_id` → `leads.id`

#### **4. `payments`** (Pagamentos)
- **45 registros**
- **RLS**: Habilitado
- **Integração**: Stripe (stripe_session_id, stripe_payment_intent_id)
- **Vinculação**: `lead_id` → `leads.id`

#### **5. `client_plans`** (Planos de Clientes)
- **1 registro**
- **RLS**: Desabilitado
- **Campos**: Planejamento individualizado (plan_steps como JSONB)
- **Vinculação**: `lead_id` → `leads.id` (único)

#### **6. `meetings`** (Reuniões)
- **2 registros**
- **RLS**: Desabilitado
- **Tipos**: 'first' (1ª estratégica), 'second' (2ª apresentação)
- **Vinculação**: `lead_id` → `leads.id`

#### **7. `term_acceptance`** (Aceitação de Termos)
- **29 registros**
- **RLS**: Habilitado
- **Vinculação**: `lead_id` → `leads.id`, `term_id` → `application_terms.id`

#### **8. `payment_proofs`** (Comprovantes de Pagamento)
- **0 registros**
- **RLS**: Habilitado
- **Métodos**: 'zelle', 'infinitepay'
- **Vinculação**: `lead_id` → `leads.id`, `payment_id` → `payments.id`

#### **9. `approval_tokens`** (Tokens de Aprovação)
- **11 registros**
- **RLS**: Habilitado
- **Uso**: Tokens únicos para acesso a formulários após aprovação
- **Vinculação**: `lead_id` → `leads.id`

#### **10. Outras Tabelas:**
- `application_terms` (2 registros) - Termos e contratos
- `partners` (9 registros) - Parceiros responsáveis por etapas
- `webhook_attempts` (1281 registros) - Logs de webhooks do Stripe
- `hotmart_clicks` (0 registros) - Cliques em links do Hotmart

---

## 🔧 Edge Functions

### **Funções Identificadas (14 funções ativas):**

#### **1. `generate-contract-pdf`**
- **Status**: ACTIVE
- **Version**: 61
- **Verify JWT**: false (pública)
- **Descrição**: Gera PDF de contratos

#### **2. `create-checkout-session`**
- **Status**: ACTIVE
- **Version**: 73
- **Verify JWT**: true (requer autenticação)
- **Descrição**: Cria sessão de checkout do Stripe

#### **3. `stripe-webhook`**
- **Status**: ACTIVE
- **Version**: 68
- **Verify JWT**: false (webhook público)
- **Descrição**: Processa webhooks do Stripe

#### **4. `approve-payment-proof`**
- **Status**: ACTIVE
- **Version**: 28
- **Verify JWT**: true
- **Descrição**: Aprova comprovantes de pagamento

#### **5. `reject-payment-proof`**
- **Status**: ACTIVE
- **Version**: 24
- **Verify JWT**: true
- **Descrição**: Rejeita comprovantes de pagamento

#### **6. `create-payment-for-proof`**
- **Status**: ACTIVE
- **Version**: 24
- **Verify JWT**: true
- **Descrição**: Cria pagamento para comprovante

#### **7. `generate-consultation-link` (hyper-api)**
- **Status**: ACTIVE
- **Version**: 24
- **Verify JWT**: true
- **Descrição**: Gera link de consultoria

#### **8. `check-pix-payment`**
- **Status**: ACTIVE
- **Version**: 24
- **Verify JWT**: true
- **Descrição**: Verifica pagamento PIX

#### **9. `generate-consultation-link-for-lead`**
- **Status**: ACTIVE
- **Version**: 30
- **Verify JWT**: true
- **Descrição**: Gera link de consultoria para lead específico

#### **10. `generate-consultation-link-with-acceptance`**
- **Status**: ACTIVE
- **Version**: 17
- **Verify JWT**: true
- **Descrição**: Gera link de consultoria com aceitação de termos

#### **11. `update-payment`**
- **Status**: ACTIVE
- **Version**: 11
- **Verify JWT**: true
- **Descrição**: Atualiza status de pagamento

#### **12. `verify-stripe-session`**
- **Status**: ACTIVE
- **Version**: 11
- **Verify JWT**: true
- **Descrição**: Verifica sessão do Stripe

#### **13. `send-second-payment-link`**
- **Status**: ACTIVE
- **Version**: 10
- **Verify JWT**: false (pública)
- **Descrição**: Envia link de segundo pagamento

#### **14. `send-plan-presentation-email`**
- **Status**: ACTIVE
- **Version**: 3
- **Verify JWT**: true
- **Descrição**: Envia email de apresentação do plano

#### **15. `cleanup-test-users`**
- **Status**: ACTIVE
- **Version**: 3
- **Verify JWT**: true
- **Descrição**: Limpa usuários de teste

### **Observações:**
- ✅ 15 funções ativas identificadas
- ⚠️ Maioria requer JWT (verify_jwt: true)
- ✅ Funções relacionadas a pagamentos, consultorias e planos

---

## 🔐 Configurações de Autenticação

### **Informações Necessárias (Coletar Manualmente):**

⚠️ **As seguintes informações precisam ser coletadas manualmente no Dashboard:**

1. **JWT Secret (Legacy HS256)** ⚠️ **CRÍTICO**
   - Localização: Settings > API > JWT Keys > Tab "Segredo do legado JWT"
   - **CRÍTICO PARA SSO**: Precisamos comparar com o do 323 Network

2. **Service Role Key**
   - Localização: Settings > API > Service Role Key
   - **SEGURO**: Manter em segredo, usar apenas server-side

3. **URLs de Redirecionamento**
   - Localização: Settings > Auth > URL Configuration
   - Site URL
   - Redirect URLs permitidas

4. **Métodos de Autenticação Habilitados**
   - Localização: Settings > Auth > Providers
   - Email/Password
   - OAuth providers

5. **Access Token Expiry**
   - Localização: Settings > API > JWT Settings
   - Tempo de expiração dos tokens (para comparar com 323 Network)

---

## 📝 Notas Importantes para SSO

### **Para Implementar SSO com 323 Network:**

1. **Estrutura de Dados Diferente:**
   - ⚠️ American Dream usa `leads` como tabela principal
   - ⚠️ 323 Network usa `profiles` como tabela principal
   - ✅ Ambos vinculam a `auth.users.id` (compatível para SSO)

2. **Autenticação:**
   - ✅ Ambos usam Supabase Auth
   - ✅ Ambos podem compartilhar Legacy JWT Secret
   - ⚠️ Verificar se Access Token Expiry é compatível

3. **Dados Separados:**
   - ✅ Dados do American Dream permanecem no banco próprio
   - ✅ Dados do 323 Network permanecem no banco próprio
   - ✅ Apenas autenticação será compartilhada

4. **Estratégia de SSO:**
   - Usuário faz login no 323 Network
   - Token JWT é validado no American Dream
   - Se `user_id` existir no `leads`, vincular automaticamente
   - Se não existir, criar lead ou vincular quando necessário

---

## 🚀 Próximos Passos

### **Informações que Ainda Precisam ser Coletadas:**

1. [ ] **Legacy JWT Secret (HS256)** ⚠️ **CRÍTICO**
   - Dashboard > Settings > API > JWT Keys > Tab "Segredo do legado JWT"
   - Comparar com o do 323 Network

2. [ ] **Service Role Key**
   - Dashboard > Settings > API > Service Role Key

3. [ ] **Access Token Expiry**
   - Dashboard > Settings > API > JWT Settings
   - Comparar com 323 Network (3600 segundos)

4. [ ] **URLs de Redirecionamento**
   - Dashboard > Settings > Auth > URL Configuration

5. [ ] **Métodos de Auth Habilitados**
   - Dashboard > Settings > Auth > Providers

---

## 📌 Checklist de Coleta de Informações

### **American Dream:**
- [x] Project ID ✅
- [x] Project URL ✅
- [x] Organization ID ✅
- [x] Anon Key ✅
- [x] Publishable Key ✅
- [x] Service Role Key ✅
- [x] Legacy JWT Secret (HS256) ✅ **COLETADO**
- [x] Access Token Expiry ✅ (3600 segundos - igual ao 323 Network)
- [x] Estrutura de dados (leads, profiles) ✅
- [x] Estatísticas (29 leads) ✅
- [ ] URLs de redirecionamento (opcional)
- [ ] Métodos de auth habilitados (opcional)

---

**Status**: ✅ Informações básicas coletadas via MCP  
**Próxima Ação**: Coletar Legacy JWT Secret e Service Role Key manualmente no Dashboard

