# 🔐 Documentação Completa: SSO 323 Network & American Dream

**Data**: 2026-01-02  
**Status**: ⚠️ **AÇÃO NECESSÁRIA NO AMERICAN DREAM**

---

## 📋 Sumário Executivo

Foi implementado um sistema de **Single Sign-On (SSO)** entre os projetos **323 Network** e **American Dream**, ambos hospedados no Supabase. Para que isso funcione, ambos os projetos precisam compartilhar o **mesmo Legacy JWT Secret**.

**⚠️ PROBLEMA CRÍTICO**: O JWT Secret do American Dream foi alterado para usar o mesmo do 323 Network. Isso invalidou **TODAS as Service Role Keys e API Keys antigas** do American Dream, fazendo com que **todas as APIs e Edge Functions parem de funcionar**.

**✅ SOLUÇÃO**: É necessário atualizar todas as referências às chaves antigas no código do American Dream com as novas chaves geradas após a mudança do JWT Secret.

---

## 🎯 Objetivo do SSO

Permitir que usuários se registrem e façam login em **qualquer um dos dois sistemas** e tenham acesso automático ao outro sistema sem precisar criar uma nova conta ou digitar senha novamente.

### Como Funciona:

1. **Usuário se registra no 323 Network** → Automaticamente cria conta no American Dream
2. **Usuário se registra no American Dream** → Automaticamente cria conta no 323 Network
3. **Usuário faz login em um sistema** → Pode navegar para o outro sistema já autenticado
4. **Mesmo email e senha funcionam em ambos os sistemas**

---

## 🔧 O Que Foi Feito

### 1. Configuração do JWT Secret Compartilhado

**Antes:**
- 323 Network JWT Secret: `[REDACTED]`
- American Dream JWT Secret: `[REDACTED]`

**Depois:**
- **Ambos os projetos agora usam**: `[REDACTED - Obter no Dashboard > Settings > API > JWT Keys > Legacy JWT Secret]`

**Onde alterar:**
- Dashboard do American Dream > Settings > API > JWT Keys > Legacy JWT Secret
- ⚠️ **JÁ FOI ALTERADO** - Não precisa fazer novamente

### 2. Sincronização Automática de Usuários

Foi criada uma **Edge Function no 323 Network** (`sync-user-to-american-dream`) que:
- Detecta quando um novo usuário se registra no 323 Network
- Cria automaticamente o mesmo usuário no American Dream
- Cria um lead correspondente na tabela `leads` do American Dream
- Usa a mesma senha do usuário

### 3. Campo Phone Adicionado

Foi adicionado o campo `phone` na tabela `profiles` do 323 Network para sincronização com o American Dream.

---

## ⚠️ PROBLEMA: Por Que Tudo Parou de Funcionar?

### O Que Aconteceu:

1. **JWT Secret foi alterado** no American Dream para usar o mesmo do 323 Network
2. **Service Role Keys são JWT tokens assinados com o JWT Secret**
3. Quando o JWT Secret muda, **todas as Service Role Keys antigas ficam inválidas**
4. **Todas as APIs e Edge Functions** que usam essas chaves param de funcionar

### Impacto:

- ❌ Edge Functions do American Dream não funcionam
- ❌ Chamadas de API do frontend falham
- ❌ Autenticação pode estar quebrada
- ❌ Qualquer código que use Service Role Key antiga falha

---

## ✅ SOLUÇÃO: O Que Precisa Ser Feito no American Dream

### Passo 1: Obter Novas Chaves de API

1. **Acesse o Dashboard do American Dream:**
   - https://supabase.com/dashboard/project/xwgdvpicgsjeyqejanwa

2. **Vá em Settings > API**

3. **Copie as NOVAS chaves:**
   - **Service Role Key** (NOVA - gerada após mudança do JWT Secret)
   - **Anon Key** (pode ter mudado também)
   - **Publishable Key** (pode ter mudado também)

4. **⚠️ IMPORTANTE**: As chaves antigas NÃO funcionam mais. Use APENAS as novas.

### Passo 2: Atualizar Variáveis de Ambiente

Procure por arquivos `.env`, `.env.local`, `.env.production` ou qualquer arquivo de configuração que contenha:

```bash
# ❌ REMOVER/ATUALIZAR ESTAS (chaves antigas):
SUPABASE_SERVICE_ROLE_KEY=[REDACTED - Obter NOVA chave do Dashboard após mudança do JWT Secret]

# ✅ SUBSTITUIR POR (chave nova - copiar do Dashboard):
SUPABASE_SERVICE_ROLE_KEY=[NOVA_CHAVE_DO_DASHBOARD]
```

### Passo 3: Atualizar Edge Functions

Todas as Edge Functions do American Dream que usam Service Role Key precisam ser atualizadas:

1. **Verificar quais Edge Functions usam Service Role Key:**
   - Procure por `createClient` com Service Role Key
   - Procure por variáveis de ambiente como `SUPABASE_SERVICE_ROLE_KEY`

2. **Atualizar secrets das Edge Functions:**
   - Dashboard > Edge Functions > [nome-da-função] > Secrets
   - Atualize `SUPABASE_SERVICE_ROLE_KEY` com a nova chave

3. **Edge Functions que provavelmente precisam atualização:**
   - `create-checkout-session`
   - `stripe-webhook`
   - `approve-payment-proof`
   - `reject-payment-proof`
   - `create-payment-for-proof`
   - `generate-consultation-link`
   - `check-pix-payment`
   - `generate-consultation-link-for-lead`
   - `generate-consultation-link-with-acceptance`
   - `update-payment`
   - `verify-stripe-session`
   - `send-plan-presentation-email`
   - `cleanup-test-users`
   - Qualquer outra que use Service Role Key

### Passo 4: Atualizar Código Frontend/Backend

Procure no código por:

1. **Hardcoded Service Role Keys:**
   ```typescript
   // ❌ REMOVER
   const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   
   // ✅ SUBSTITUIR POR
   const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Referências a chaves antigas:**
   - Procure por qualquer string que comece com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Substitua por variáveis de ambiente

3. **Configurações de Supabase Client:**
   ```typescript
   // Verificar se está usando a chave correta
   import { createClient } from '@supabase/supabase-js'
   
   const supabase = createClient(
     process.env.SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ Usar variável de ambiente
   )
   ```

### Passo 5: Atualizar Secrets em Serviços Externos

Se o American Dream usa serviços externos (Vercel, Railway, etc.):

1. **Vercel:**
   - Settings > Environment Variables
   - Atualize `SUPABASE_SERVICE_ROLE_KEY`

2. **Railway/Render/Outros:**
   - Atualize variáveis de ambiente com a nova Service Role Key

### Passo 6: Testar Tudo

Após atualizar, teste:

1. ✅ Login/Registro de usuários
2. ✅ Edge Functions (especialmente as relacionadas a pagamentos)
3. ✅ Webhooks do Stripe
4. ✅ Criação de leads
5. ✅ Qualquer funcionalidade que use Service Role Key

---

## 📊 Informações Técnicas do American Dream

### Projeto Supabase

- **Project ID**: `xwgdvpicgsjeyqejanwa`
- **Project URL**: `https://xwgdvpicgsjeyqejanwa.supabase.co`
- **Organization**: American Dream (`gvimpsiulkpduxkbvsjf`)
- **Região**: `us-west-1`

### JWT Secret (ATUAL)

- **Legacy JWT Secret**: `[REDACTED - Obter no Dashboard > Settings > API > JWT Keys > Legacy JWT Secret]`
- **⚠️ IMPORTANTE**: Este é o mesmo JWT Secret do 323 Network
- **Access Token Expiry**: 604800 segundos (7 dias) - configurado para máximo permitido

### Chaves de API (NOVAS - Obter do Dashboard)

⚠️ **NÃO USE AS CHAVES ANTIGAS**. Obtenha as novas diretamente do Dashboard:

1. **Service Role Key**: Dashboard > Settings > API > Service Role Key
2. **Anon Key**: Dashboard > Settings > API > Anon Key
3. **Publishable Key**: Dashboard > Settings > API > Publishable Key

### Estrutura de Dados

- **Tabela principal**: `leads` (29 registros)
- **Tabela de usuários**: `auth.users` (vinculada a `leads.user_id`)
- **Tabela profiles**: Existe mas não está sendo usada ativamente (0 registros)

---

## 🔄 Sincronização Bidirecional

### 323 Network → American Dream

**Edge Function**: `sync-user-to-american-dream` (no projeto 323 Network)

**O que faz:**
1. Detecta novo registro no 323 Network
2. Cria usuário no American Dream com `admin.createUser()`
3. Cria lead na tabela `leads` do American Dream
4. Usa a mesma senha do usuário
5. Adiciona `user_metadata.source = '323-network'` para prevenir loops

**Secrets necessários no 323 Network:**
- `AMERICAN_DREAM_URL`: `https://xwgdvpicgsjeyqejanwa.supabase.co`
- `AMERICAN_DREAM_SERVICE_ROLE_KEY`: [Nova Service Role Key do American Dream]

### American Dream → 323 Network

**Edge Function**: `sync-user-to-323-network` (precisa ser criada no American Dream)

**O que deve fazer:**
1. Detecta novo registro no American Dream
2. Cria usuário no 323 Network com `admin.createUser()`
3. Cria profile na tabela `profiles` do 323 Network
4. Usa a mesma senha do usuário
5. Adiciona `user_metadata.source = 'american-dream'` para prevenir loops

**Secrets necessários no American Dream:**
- `SUPABASE_323_URL`: `https://pgdvbanwumqjmqeybqnw.supabase.co`
- `SUPABASE_323_SERVICE_ROLE_KEY`: [Service Role Key do 323 Network]

---

## 🚨 Checklist de Ações Necessárias

### No Código do American Dream:

- [ ] **1. Obter novas chaves do Dashboard**
  - [ ] Service Role Key (NOVA)
  - [ ] Anon Key (verificar se mudou)
  - [ ] Publishable Key (verificar se mudou)

- [ ] **2. Atualizar variáveis de ambiente**
  - [ ] `.env` local
  - [ ] `.env.production`
  - [ ] Variáveis em serviços externos (Vercel, Railway, etc.)

- [ ] **3. Atualizar Edge Functions**
  - [ ] Verificar quais usam Service Role Key
  - [ ] Atualizar secrets no Dashboard
  - [ ] Testar cada Edge Function

- [ ] **4. Atualizar código frontend/backend**
  - [ ] Remover hardcoded keys
  - [ ] Usar variáveis de ambiente
  - [ ] Verificar todas as referências a chaves antigas

- [ ] **5. Testar funcionalidades críticas**
  - [ ] Login/Registro
  - [ ] Pagamentos (Stripe)
  - [ ] Webhooks
  - [ ] Criação de leads
  - [ ] Consultas

- [ ] **6. Implementar sincronização reversa (opcional)**
  - [ ] Criar Edge Function `sync-user-to-323-network`
  - [ ] Configurar secrets do 323 Network
  - [ ] Integrar no fluxo de registro do American Dream

---

## 📝 Notas Importantes

### Por Que Isso Foi Necessário?

Para implementar SSO entre dois projetos Supabase separados, é necessário que ambos compartilhem o mesmo JWT Secret. Isso permite que tokens JWT emitidos por um sistema sejam validados pelo outro.

### Por Que Quebrou Tudo?

Service Role Keys e Anon Keys são JWT tokens assinados com o JWT Secret. Quando o JWT Secret muda, todas as chaves antigas ficam inválidas porque não podem mais ser verificadas com o novo secret.

### Como Prevenir Isso no Futuro?

1. **Nunca mude o JWT Secret sem planejamento**
2. **Use variáveis de ambiente** para todas as chaves
3. **Documente todas as dependências** de chaves
4. **Teste em ambiente de desenvolvimento** antes de produção

### E Se Precisar Reverter?

Se precisar reverter a mudança do JWT Secret:

1. **⚠️ ATENÇÃO**: Isso vai quebrar o SSO
2. Volte o JWT Secret do American Dream para o valor antigo
3. Todas as chaves antigas voltarão a funcionar
4. Mas o SSO entre os sistemas não funcionará mais

---

## 🔗 Referências

### Documentação Supabase

- [JWT Secret](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts)
- [Service Role Key](https://supabase.com/docs/guides/auth/auth-helpers/service-role-key)
- [Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)

### Projetos Relacionados

- **323 Network**: `pgdvbanwumqjmqeybqnw`
- **American Dream**: `xwgdvpicgsjeyqejanwa`

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique os logs das Edge Functions no Dashboard
2. Verifique se as chaves estão corretas
3. Teste cada funcionalidade individualmente
4. Consulte a documentação do Supabase

---

**Última atualização**: 2026-01-02  
**Status**: ⚠️ Ação necessária no código do American Dream

