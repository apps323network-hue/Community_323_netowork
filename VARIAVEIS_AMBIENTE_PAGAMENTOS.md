# 🔐 Variáveis de Ambiente - Integração Pagamentos

## 📋 Valores das Variáveis

### 1. `SUPABASE_323_NETWORK_URL` ✅ (Já tem valor)

**Valor:**
```
https://pgdvbanwumqjmqeybqnw.supabase.co
```

**Onde usar:**
- No American Dream, para chamar a Edge Function do 323 Network
- Esta é a URL base do projeto Supabase do 323 Network

---

### 2. `AMERICAN_DREAM_SHARED_API_KEY` ⚠️ (PRECISA SER CRIADA)

**Status:** ⚠️ **AINDA NÃO FOI CONFIGURADA**

**O que é:**
- Uma chave secreta compartilhada entre os dois projetos
- Usada para autenticar chamadas do American Dream para o 323 Network
- Deve ser a MESMA nos dois projetos

**Como gerar:**

#### Opção 1: Gerar token aleatório seguro
```bash
# No terminal (Linux/Mac)
openssl rand -hex 32

# Ou no PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Opção 2: Usar um UUID longo
```bash
# Gerar UUID v4
uuidgen  # Linux/Mac
# Ou use um gerador online: https://www.uuidgenerator.net/
```

#### Opção 3: Token simples (menos seguro, mas funcional)
```
american_dream_323_network_2026_shared_key_secure
```

**Exemplo de token gerado:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## 🔧 Onde Configurar

### No 323 Network (Supabase)

1. **Acesse o Dashboard:**
   - https://supabase.com/dashboard/project/pgdvbanwumqjmqeybqnw

2. **Vá em Edge Functions > Secrets:**
   - Menu lateral > Edge Functions > Secrets (ou Settings > Edge Functions)

3. **Adicione o Secret:**
   - **Nome:** `AMERICAN_DREAM_SHARED_API_KEY`
   - **Valor:** O token que você gerou (ex: `a1b2c3d4e5f6...`)

4. **Salve**

**Ou via CLI:**
```bash
supabase secrets set AMERICAN_DREAM_SHARED_API_KEY=seu_token_aqui --project-ref pgdvbanwumqjmqeybqnw
```

---

### No American Dream

**Opção 1: Variável de Ambiente (Edge Functions)**
1. Acesse o Dashboard do American Dream
2. Vá em Edge Functions > Secrets
3. Adicione:
   - **Nome:** `AMERICAN_DREAM_SHARED_API_KEY`
   - **Valor:** O MESMO token configurado no 323 Network

**Opção 2: Arquivo .env (se usar localmente)**
```bash
AMERICAN_DREAM_SHARED_API_KEY=seu_token_aqui
SUPABASE_323_NETWORK_URL=https://pgdvbanwumqjmqeybqnw.supabase.co
```

**Opção 3: Variáveis de Ambiente do Sistema**
```bash
export AMERICAN_DREAM_SHARED_API_KEY=seu_token_aqui
export SUPABASE_323_NETWORK_URL=https://pgdvbanwumqjmqeybqnw.supabase.co
```

---

## ✅ Checklist de Configuração

- [ ] Gerar token seguro para `AMERICAN_DREAM_SHARED_API_KEY`
- [ ] Configurar no 323 Network (Supabase Dashboard > Edge Functions > Secrets)
- [ ] Configurar no American Dream (mesmo valor)
- [ ] Testar chamada da Edge Function

---

## 🧪 Teste Rápido

Após configurar, teste se está funcionando:

```bash
curl -X POST https://pgdvbanwumqjmqeybqnw.supabase.co/functions/v1/sync-american-dream-payment \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-teste",
    "payment_id": "test-123",
    "amount": 10000,
    "currency": "USD",
    "payment_method": "card",
    "status": "completed"
  }'
```

**Resposta esperada (se token correto):**
```json
{
  "success": false,
  "error": "User not found in 323 Network: uuid-teste"
}
```
(Isso significa que a autenticação funcionou, mas o usuário não existe - o que é esperado)

**Resposta se token incorreto:**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

---

## 📝 Resumo dos Valores

| Variável | Valor | Status |
|----------|-------|--------|
| `SUPABASE_323_NETWORK_URL` | `https://pgdvbanwumqjmqeybqnw.supabase.co` | ✅ Configurado |
| `AMERICAN_DREAM_SHARED_API_KEY` | `[GERAR TOKEN]` | ⚠️ Precisa configurar |

---

## 🔒 Segurança

**⚠️ IMPORTANTE:**
- Nunca commite o token no Git
- Use variáveis de ambiente ou secrets do Supabase
- O token deve ser diferente em dev/test/prod (ou o mesmo se quiser)
- Mantenha o token seguro - ele dá acesso à Edge Function

---

**Última atualização**: 2026-01-02


