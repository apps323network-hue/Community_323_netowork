# 📊 Informações do Projeto 323 Network - Supabase

**Data de Coleta**: 2026-01-02  
**Método**: MCP Supabase API

---

## 🏢 Informações do Projeto

### **Identificação**
- **Project ID (ref)**: `pgdvbanwumqjmqeybqnw`
- **Nome**: `323 network community`
- **Status**: `ACTIVE_HEALTHY`
- **Região**: `us-west-2`
- **Criado em**: `2025-12-22T22:24:27.827936Z`

### **Organização**
- **Organization ID**: `jkpjsvqezxvfjcwcyhin`
- **Organization Slug**: `jkpjsvqezxvfjcwcyhin`
- **Organization Name**: `323 network`
- **Plan**: `free`
- **Allowed Release Channels**: `ga`, `preview`

### **URLs e Endpoints**
- **Project URL**: `https://pgdvbanwumqjmqeybqnw.supabase.co`
- **Database Host**: `db.pgdvbanwumqjmqeybqnw.supabase.co`
- **Database Version**: `17.6.1.063`
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
- **ID**: `9431b337-e241-42d2-b8e0-24d2717446f0`

### **Service Role Key**
- **Status**: ✅ COLETADA
- **Localização**: Supabase Dashboard > Settings > API > Service Role Key
- **⚠️ SEGREDO CRÍTICO**: Esta chave deve ser mantida em segredo e nunca exposta no frontend
- **⚠️ NUNCA commitar no código**: Usar apenas em variáveis de ambiente server-side
- **Key**: `[REDACTED - Obter no Dashboard > Settings > API > Service Role Key]`
- **Uso**: Validação server-side de tokens, operações administrativas

### **JWT Secret e Chaves de Assinatura**

#### **Chave Atual (ECC P-256) - Moderna:**
- **Key ID**: `d2956ee8-1f0e-43bc-bc0f-85435475334f`
- **Tipo**: `ECC (P-256)`
- **Status**: CHAVE ATUAL (CURRENT KEY)
- **Secret Key**: `[REDACTED - Obter no Dashboard > Settings > API > JWT Keys]`
- **⚠️ NOTA**: Esta é uma chave moderna (ECC), mas para SSO pode precisar do Legacy JWT Secret

#### **Legacy JWT Secret (HS256):** ✅ COLETADO
- **Status**: ✅ **AINDA EM USO** ("still used")
- **Secret**: `[REDACTED - Obter no Dashboard > Settings > API > JWT Keys > Legacy JWT Secret]`
- **Tipo**: HS256 (Shared Secret)
- **⚠️ CRÍTICO PARA SSO**: Esta é a chave que precisaremos compartilhar com o American Dream
- **Nota**: Foi migrado para novas JWT Signing Keys, mas ainda é usado para verificar tokens
- **Access Token Expiry**: 3600 segundos (1 hora)
- **Uso**: Usado apenas para verificar JWTs (inclui anon e service_role JWT based API keys)

#### **Chaves Relacionadas:**
- **Chave Standby Identificada**: `5cfbc657-5f26-4781-a34e-09fb712880b8` (HS256 - em espera)
- **Chave Anterior Identificada**: `17BF52CA-8EB3-4A74-B4F2-EF9DB7ADAE14` (rotacionada há 11 dias)

#### **⚠️ IMPORTANTE PARA SSO:**
Para SSO entre dois projetos Supabase, geralmente precisamos do **Legacy JWT Secret (HS256)**, não da chave ECC moderna. Verifique a aba "Segredo do legado JWT" no Dashboard para obter o secret atual.

---

## 👥 Estrutura de Usuários

### **Estatísticas de Usuários**
- **Total de Usuários**: `6`
- **Usuários com role 'user'**: `5`
- **Usuários com role 'admin'**: `1`
- **Usuários com role 'partner'**: `0`
- **Usuários Ativos (status='active')**: `6`
- **Usuários Pendentes (status='pending')**: `0`

### **Tabela `profiles` - Estrutura Completa**

A tabela `profiles` é a tabela principal de usuários e está vinculada à tabela `auth.users` do Supabase Auth.

#### **Campos Principais:**
| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | uuid | NO | - | Primary Key, vinculado a `auth.users.id` |
| `nome` | text | YES | - | Nome do usuário |
| `email` | text | YES | - | Email do usuário |
| `role` | text | YES | 'user' | Role: 'user', 'partner', 'admin' |
| `status` | text | YES | 'pending' | Status: 'pending', 'active', 'suspended', 'banned' |
| `plano` | text | YES | 'Free' | Plano: 'Free', 'Member', 'Premium' |
| `badge` | text | YES | 'Free' | Badge do usuário |
| `avatar_url` | text | YES | - | URL do avatar |
| `bio` | text | YES | - | Resumo profissional |
| `area_atuacao` | text | YES | - | Área de atuação |
| `cidade` | text | YES | - | Cidade |
| `pais` | text | YES | 'USA' | País |
| `objetivo` | text | YES | - | Objetivo profissional |
| `whatsapp` | text | YES | - | WhatsApp |
| `linkedin` | text | YES | - | LinkedIn |
| `instagram` | text | YES | - | Instagram |
| `tags` | text[] | YES | '{}' | Array de tags/interesses |
| `goals` | text[] | YES | '{}' | Array de objetivos |
| `is_public` | boolean | YES | true | Se perfil é público |
| `job_notifications` | boolean | YES | false | Preferência de notificações |
| `approved_by` | uuid | YES | - | ID do admin que aprovou |
| `approved_at` | timestamptz | YES | - | Data de aprovação |
| `rejection_reason` | text | YES | - | Motivo de rejeição |
| `strikes` | integer | YES | 0 | Contador de strikes |
| `suspended_until` | timestamptz | YES | - | Data de expiração de suspensão |
| `total_points` | integer | YES | 0 | Total de pontos acumulados |
| `created_at` | timestamptz | YES | now() | Data de criação |
| `updated_at` | timestamptz | YES | now() | Data de atualização |

#### **Constraints e Relacionamentos:**
- **Primary Key**: `id` (uuid)
- **Foreign Key**: `id` → `auth.users.id` (profiles_id_fkey)
- **Foreign Key**: `approved_by` → `auth.users.id` (profiles_approved_by_fkey)
- **RLS (Row Level Security)**: ✅ Habilitado

#### **Valores Permitidos:**
- **role**: 'user', 'partner', 'admin'
- **status**: 'pending', 'active', 'suspended', 'banned'
- **plano**: 'Free', 'Member', 'Premium'

---

## 📊 Estrutura do Banco de Dados

### **Tabelas Principais Identificadas:**

#### **1. `profiles`** (Usuários/Perfis)
- 6 registros
- RLS habilitado
- Vinculado a `auth.users`

#### **2. `posts`** (Posts/Conteúdo)
- 27 registros
- RLS habilitado
- Tipos: 'networking', 'ofereco_servico', 'procuro_ajuda', 'oportunidade'
- Status: 'pending', 'approved', 'hidden', 'removed', 'spam'

#### **3. `events`** (Eventos)
- 2 registros
- RLS desabilitado (temporariamente para debug)
- Tipos: 'presencial', 'webinar'
- Status: 'pending', 'approved', 'rejected'

#### **4. `partners`** (Parceiros)
- 1 registro
- RLS habilitado

#### **5. `services`** (Serviços)
- 7 registros
- RLS habilitado
- Integração com Stripe para pagamentos

#### **6. `benefits`** (Benefícios)
- 10 registros
- RLS habilitado
- Tipos: 'mensal', 'fixo', 'plano'

#### **7. `programs`** (Programas/Cursos) ⭐ NOVO
- 0 registros (tabela criada mas vazia)
- RLS habilitado
- Suporta multilíngue (pt/en)
- Integração com Google Classroom
- Sistema de matrículas e pagamentos

#### **8. `program_enrollments`** (Matrículas em Programas)
- 0 registros
- RLS habilitado
- Status: 'pending', 'active', 'completed', 'cancelled'

#### **9. `program_reviews`** (Avaliações de Programas)
- 0 registros
- RLS habilitado

#### **10. Outras Tabelas:**
- `post_comments` (7 registros)
- `post_likes` (5 registros)
- `connections` (3 registros)
- `notifications` (10 registros)
- `service_requests` (13 registros)
- `service_payments` (12 registros)
- `user_benefits` (0 registros)
- `member_bookmarks` (5 registros)
- `banned_words` (41 registros)
- `reports` (5 registros)
- `challenges` (15 registros)
- `user_challenges` (0 registros)
- `user_points` (4 registros)
- `admin_logs` (100 registros)
- `post_bookmarks` (2 registros)
- `post_mentions` (5 registros)
- `post_hashtags` (0 registros)
- `event_confirmations` (1 registro)

---

## 🔧 Edge Functions

### **Funções Identificadas:**

#### **1. `send-email`**
- **Status**: ACTIVE
- **Version**: 16
- **Verify JWT**: false (pública)
- **ID**: `81a377bd-cdaf-4c3a-a512-fd7c0ac71888`
- **Descrição**: Envio de emails via SMTP
- **Última atualização**: 2026-01-02

#### **2. `create-service-checkout`**
- **Status**: ACTIVE
- **Version**: 14
- **Verify JWT**: false (pública)
- **ID**: `763e71bb-85ed-40ac-8414-0ea5ba0d3895`
- **Descrição**: Criar checkout de serviço (Stripe)
- **Última atualização**: 2026-01-02

#### **3. `stripe-webhook`**
- **Status**: ACTIVE
- **Version**: 9
- **Verify JWT**: false (webhook público)
- **ID**: `82ad92e4-52d4-4724-97ef-1758a028d8ef`
- **Descrição**: Webhook do Stripe para processar pagamentos
- **Última atualização**: 2026-01-02

#### **4. `check-payment-status`**
- **Status**: ACTIVE
- **Version**: 4
- **Verify JWT**: false (pública)
- **ID**: `2be965d3-93d4-4cee-b5d4-4c4b0dde33ec`
- **Descrição**: Verificar status de pagamento
- **Última atualização**: 2026-01-02

#### **5. `get-admin-emails`**
- **Status**: ACTIVE
- **Version**: 4
- **Verify JWT**: false (pública)
- **ID**: `ba75769a-3eba-4dca-8ff4-cb15f4fa74b7`
- **Descrição**: Buscar emails de admins para notificações
- **Última atualização**: 2026-01-02

### **Observações:**
- ⚠️ Todas as funções têm `verify_jwt: false`, o que significa que são públicas
- ⚠️ Para SSO, pode ser necessário criar uma nova Edge Function com verificação JWT
- ✅ Funções estão ativas e funcionando

---

## 🔐 Configurações de Autenticação

### **Informações Necessárias (Coletar Manualmente):**

⚠️ **As seguintes informações precisam ser coletadas manualmente no Dashboard:**

1. **JWT Secret**
   - Localização: Settings > API > JWT Settings > JWT Secret
   - **CRÍTICO**: Necessário para implementar SSO com American Dream

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
   - OAuth providers (Google, GitHub, etc.)

5. **Configurações de Email**
   - Localização: Settings > Auth > Email Templates
   - Templates de confirmação, reset de senha, etc.

---

## 📝 Notas Importantes para SSO

### **Para Implementar SSO com American Dream:**

1. **JWT Secret Compartilhado:**
   - ⚠️ Precisamos obter o JWT Secret do 323 Network
   - ⚠️ Precisamos obter o JWT Secret do American Dream
   - ⚠️ Configurar ambos para usar a mesma chave (ou usar a do 323 Network)

2. **Estrutura de Usuários:**
   - ✅ Tabela `profiles` está bem estruturada
   - ✅ Vinculada a `auth.users` do Supabase Auth
   - ✅ Campos relevantes: `id`, `email`, `nome`, `role`, `status`

3. **Dados Sensíveis:**
   - ⚠️ Garantir que apenas autenticação seja compartilhada
   - ⚠️ Dados do `profiles` permanecem no banco do 323 Network
   - ⚠️ American Dream terá seu próprio banco de dados

4. **RLS (Row Level Security):**
   - ✅ RLS está habilitado na maioria das tabelas
   - ⚠️ Verificar políticas RLS ao implementar SSO
   - ⚠️ Garantir que tokens compartilhados respeitem as políticas

---

## 🚀 Próximos Passos

### **Informações que Ainda Precisam ser Coletadas:**

1. [ ] **JWT Secret** do 323 Network (Dashboard > Settings > API > JWT Settings)
2. [ ] **Service Role Key** do 323 Network (Dashboard > Settings > API)
3. [ ] **URLs de Redirecionamento** configuradas (Dashboard > Settings > Auth)
4. [ ] **Métodos de Auth** habilitados (Dashboard > Settings > Auth > Providers)
5. [ ] **Informações do American Dream** (Project ID, Keys, JWT Secret, etc.)

### **Após Coletar Todas as Informações:**

1. Comparar JWT Secrets dos dois projetos
2. Decidir estratégia de compartilhamento
3. Implementar middleware de validação
4. Testar autenticação cruzada

---

## 📌 Checklist de Coleta de Informações

### **323 Network (Este Projeto):**
- [x] Project ID
- [x] Project URL
- [x] Organization ID
- [x] Anon Key
- [x] Publishable Key
- [x] JWT Key ID (ECC P-256 moderna)
- [x] JWT Secret Key (sb_secret_...) ✅ [REDACTED]
- [x] Service Role Key ✅
- [x] Legacy JWT Secret (HS256) - Chave ATUAL ✅
- [x] Estrutura de dados (profiles)
- [x] Estatísticas de usuários
- [ ] URLs de redirecionamento ⚠️
- [ ] Métodos de auth habilitados ⚠️

### **American Dream:**
- [ ] Project ID
- [ ] Project URL
- [ ] Organization ID
- [ ] Anon Key
- [ ] Service Role Key
- [ ] JWT Secret
- [ ] Estrutura de dados
- [ ] Estatísticas de usuários
- [ ] URLs de redirecionamento
- [ ] Métodos de auth habilitados

---

**Status**: ✅ Informações básicas coletadas via MCP  
**Próxima Ação**: Coletar informações restantes manualmente no Dashboard e do projeto American Dream

