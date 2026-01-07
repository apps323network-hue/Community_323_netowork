# 🚨 GUIA TÉCNICO: Atualização Urgente - American Dream

**⚠️ AÇÃO NECESSÁRIA IMEDIATA**

O JWT Secret do projeto American Dream foi alterado para implementar SSO com o 323 Network. Isso invalidou todas as Service Role Keys e API Keys antigas.

---

## 🎯 O Que Precisa Ser Feito

**TODAS as referências às chaves antigas no código precisam ser atualizadas com as novas chaves.**

---

## 📋 Passo a Passo

### 1. Obter Novas Chaves

1. Acesse: https://supabase.com/dashboard/project/xwgdvpicgsjeyqejanwa
2. Vá em: **Settings > API**
3. Copie:
   - **Service Role Key** (NOVA - gerada após mudança do JWT Secret)
   - **Anon Key** (verificar se mudou)
   - **Publishable Key** (verificar se mudou)

### 2. Buscar Chaves Antigas no Código

Execute estas buscas no código:

```bash
# Buscar Service Role Key antiga
grep -r "[SERVICE_ROLE_KEY_ANTIGA]" .

# Buscar referências a SUPABASE_SERVICE_ROLE_KEY
grep -r "SUPABASE_SERVICE_ROLE_KEY" .

# Buscar createClient com chaves hardcoded
grep -r "createClient.*service.*role" .
```

### 3. Atualizar Arquivos

#### 3.1 Variáveis de Ambiente

**Arquivos a verificar:**
- `.env`
- `.env.local`
- `.env.production`
- `.env.development`
- Qualquer arquivo `.env.*`

**O que atualizar:**
```bash
# ❌ REMOVER/ATUALIZAR
SUPABASE_SERVICE_ROLE_KEY=[REDACTED - Obter NOVA chave do Dashboard após mudança do JWT Secret]

# ✅ SUBSTITUIR POR (nova chave do Dashboard)
SUPABASE_SERVICE_ROLE_KEY=[NOVA_CHAVE_DO_DASHBOARD]
```

#### 3.2 Código TypeScript/JavaScript

**Buscar e substituir:**

```typescript
// ❌ REMOVER hardcoded keys
const supabase = createClient(
  'https://xwgdvpicgsjeyqejanwa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Chave antiga
)

// ✅ SUBSTITUIR POR
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Variável de ambiente
)
```

#### 3.3 Edge Functions

**Para cada Edge Function:**

1. Verificar se usa Service Role Key:
   ```typescript
   const supabase = createClient(
     Deno.env.get('SUPABASE_URL')!,
     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
   )
   ```

2. Atualizar secret no Dashboard:
   - Dashboard > Edge Functions > [nome-da-função] > Secrets
   - Atualize `SUPABASE_SERVICE_ROLE_KEY` com a nova chave

**Edge Functions que provavelmente precisam atualização:**
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

### 4. Atualizar Serviços Externos

#### 4.1 Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto American Dream
3. Vá em: **Settings > Environment Variables**
4. Atualize: `SUPABASE_SERVICE_ROLE_KEY` com a nova chave
5. **Redeploy** o projeto

#### 4.2 Railway/Render/Outros

1. Acesse o painel do serviço
2. Vá em Environment Variables
3. Atualize `SUPABASE_SERVICE_ROLE_KEY`
4. Reinicie o serviço

### 5. Testar

Após atualizar, teste:

```bash
# 1. Testar login
# 2. Testar registro
# 3. Testar Edge Functions
# 4. Testar pagamentos (Stripe)
# 5. Testar webhooks
```

---

## 🔍 Checklist Rápido

- [ ] Obter novas chaves do Dashboard
- [ ] Buscar chaves antigas no código
- [ ] Atualizar `.env` e variáveis de ambiente
- [ ] Atualizar código TypeScript/JavaScript
- [ ] Atualizar secrets das Edge Functions
- [ ] Atualizar variáveis em serviços externos
- [ ] Testar login/registro
- [ ] Testar Edge Functions
- [ ] Testar pagamentos
- [ ] Testar webhooks

---

## 📊 Informações do Projeto

- **Project ID**: `xwgdvpicgsjeyqejanwa`
- **Project URL**: `https://xwgdvpicgsjeyqejanwa.supabase.co`
- **JWT Secret (NOVO)**: `[REDACTED - Obter no Dashboard > Settings > API > JWT Keys > Legacy JWT Secret]`

---

## ⚠️ Erros Comuns

### Erro: "Invalid API key"

**Causa**: Usando chave antiga  
**Solução**: Atualizar com nova chave do Dashboard

### Erro: "JWT expired" ou "Invalid token"

**Causa**: Token assinado com JWT Secret antigo  
**Solução**: Fazer novo login/registro

### Edge Function retorna 401

**Causa**: Secret da Edge Function está desatualizado  
**Solução**: Atualizar secret no Dashboard > Edge Functions > Secrets

---

## 🆘 Se Nada Funcionar

1. Verifique se copiou a chave correta do Dashboard
2. Verifique se não há espaços extras na chave
3. Verifique se atualizou TODAS as referências
4. Limpe cache e reinicie serviços
5. Verifique logs das Edge Functions no Dashboard

---

**Última atualização**: 2026-01-02

