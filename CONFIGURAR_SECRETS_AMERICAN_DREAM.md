# 🔐 Como Configurar Secrets do American Dream

**Problema**: Edge Function retorna erro "Invalid API key"  
**Causa**: Service Role Key antiga foi invalidada após mudança do JWT Secret  
**Solução**: Obter NOVA Service Role Key e configurar secrets no Supabase Dashboard

---

## ⚠️ IMPORTANTE: Service Role Key Precisa Ser Atualizada

**Por que?**
- A Service Role Key é um JWT token assinado com o Legacy JWT Secret
- Quando mudamos o JWT Secret do American Dream para usar o mesmo do 323 Network, a Service Role Key antiga ficou inválida
- **Precisamos obter uma NOVA Service Role Key** que foi assinada com o novo JWT Secret

---

## 📍 Passo 1: Obter Nova Service Role Key do American Dream

1. **Acesse o Dashboard do American Dream:**
   - https://supabase.com/dashboard/project/xwgdvpicgsjeyqejanwa

2. **Vá em Settings > API:**
   - Menu lateral > Settings > API

3. **Copie a Service Role Key:**
   - Role: `service_role`
   - Clique em "Reveal" para mostrar a chave
   - **⚠️ IMPORTANTE**: Copie a chave COMPLETA (é um JWT longo)
   - ⚠️ **CUIDADO**: Esta é uma chave sensível - nunca exponha no frontend

4. **Verifique se a chave é diferente da antiga:**
   - A chave antiga começava com: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - A nova chave deve ser diferente (mesmo formato, mas conteúdo diferente)

---

## 📍 Passo 2: Configurar Secrets no 323 Network

1. **Acesse o Dashboard do 323 Network:**
   - https://supabase.com/dashboard/project/pgdvbanwumqjmqeybqnw

2. **Vá em Edge Functions > Secrets:**
   - Menu lateral > Edge Functions > Secrets

---

## 🔑 Secrets Necessários

### 1. AMERICAN_DREAM_URL

**Nome**: `AMERICAN_DREAM_URL`  
**Valor**: `https://xwgdvpicgsjeyqejanwa.supabase.co`

**Como obter:**
- Dashboard do American Dream > Settings > API > Project URL
- Ou use: `https://xwgdvpicgsjeyqejanwa.supabase.co`

---

### 2. AMERICAN_DREAM_SERVICE_ROLE_KEY

**Nome**: `AMERICAN_DREAM_SERVICE_ROLE_KEY`  
**Valor**: 
```
[REDACTED - Obter NOVA chave do Dashboard > Settings > API > Service Role Key]
```

**Como obter:**
- Dashboard do American Dream > Settings > API > Service Role Key
- ⚠️ **CRÍTICO**: Esta é a NOVA chave gerada após mudar o JWT Secret (iat: 1767386796)
- ⚠️ **CUIDADO**: Esta é uma chave sensível - nunca exponha no frontend

---

## 📝 Passo a Passo

1. **Acesse o Dashboard do 323 Network:**
   - https://supabase.com/dashboard/project/pgdvbanwumqjmqeybqnw

2. **Vá em Edge Functions > Secrets:**
   - Menu lateral > Edge Functions > Secrets

3. **Adicione o primeiro secret:**
   - Clique em "Add new secret"
   - **Name**: `AMERICAN_DREAM_URL`
   - **Value**: `https://xwgdvpicgsjeyqejanwa.supabase.co`
   - Clique em "Add secret"

4. **Adicione o segundo secret:**
   - Clique em "Add new secret" novamente
   - **Name**: `AMERICAN_DREAM_SERVICE_ROLE_KEY`
   - **Value**: `[REDACTED - Obter NOVA chave do Dashboard > Settings > API > Service Role Key]`
   - ⚠️ **IMPORTANTE**: Se já existe um secret com esse nome, você pode:
     - **Opção A**: Deletar o antigo e criar um novo
     - **Opção B**: Editar o existente (se o Dashboard permitir)
   - Clique em "Add secret" ou "Update secret"

5. **Verifique:**
   - Você deve ver ambos os secrets listados
   - ✅ `AMERICAN_DREAM_URL`
   - ✅ `AMERICAN_DREAM_SERVICE_ROLE_KEY`

---

## ✅ Como Verificar se Funcionou

1. Faça um novo registro no 323 Network
2. Abra o console do navegador (F12)
3. Procure por logs que começam com `[SSO]` e `[EDGE]`
4. Se funcionar, você verá:
   - `[SSO] ✅ Edge Function chamada com sucesso!`
   - `[EDGE] ✅ Usuário criado no American Dream`

5. Verifique no Dashboard do American Dream:
   - Authentication > Users → deve ter o novo usuário
   - Table Editor > `leads` → deve ter um lead com o mesmo email

---

## ❌ Se Ainda Não Funcionar

### Verificar Logs da Edge Function

1. Dashboard > Edge Functions > `sync-user-to-american-dream` > Logs
2. Procure por erros que começam com `[EDGE]`
3. Os logs mostrarão exatamente qual secret está faltando ou incorreto

### Erros Comuns

**Erro: "Missing environment variables"**
- ✅ Verifique se ambos os secrets estão configurados
- ✅ Verifique se os nomes estão exatamente como mostrado acima (case-sensitive)

**Erro: "Invalid API key"**
- ✅ Verifique se `AMERICAN_DREAM_SERVICE_ROLE_KEY` está correto
- ✅ Copie a Service Role Key diretamente do Dashboard do American Dream
- ✅ Certifique-se de não ter espaços extras no início/fim

**Erro: "Failed to fetch" ou timeout**
- ✅ Verifique se `AMERICAN_DREAM_URL` está correto
- ✅ Verifique se o projeto American Dream está ativo

---

## 🔍 Verificar Secrets Configurados

Você pode verificar se os secrets estão configurados olhando os logs da Edge Function:

1. Dashboard > Edge Functions > `sync-user-to-american-dream` > Logs
2. Procure por linhas que começam com `[EDGE] Verificando secrets...`
3. Deve mostrar:
   - `[EDGE] AMERICAN_DREAM_URL: ✅ Configurado`
   - `[EDGE] AMERICAN_DREAM_SERVICE_ROLE_KEY: ✅ Configurado`

Se mostrar `❌ FALTANDO`, o secret não está configurado.

