# 🧪 Guia de Testes - SSO 323 Network ↔ American Dream

**Data**: 2026-01-02  
**Status**: JWT Secret compartilhado configurado ✅

---

## ✅ Pré-requisitos Verificados

- [x] Migration `add_phone_to_profiles` aplicada
- [x] Edge Functions deployadas:
  - [x] `sync-user-to-american-dream` (ACTIVE)
  - [x] `sync-user-to-323-network` (ACTIVE)
- [x] JWT Secret compartilhado configurado no American Dream
- [x] Secrets configurados no Supabase Dashboard (AMERICAN_DREAM_URL, AMERICAN_DREAM_SERVICE_ROLE_KEY)

---

## 🧪 Teste 1: Validação de Token JWT Compartilhado

### Objetivo
Verificar se um token gerado no 323 Network é válido no American Dream.

### Passos

1. **Fazer login no 323 Network:**
   - Acesse: `https://323network.com/login`
   - Faça login com uma conta existente
   - Abra o DevTools (F12) > Console
   - Execute:
   ```javascript
   // Pegar token atual
   const session = await window.supabase.auth.getSession()
   console.log('Token:', session.data.session?.access_token)
   ```
   - Copie o token

2. **Validar token no American Dream:**
   - Acesse: `https://americandream.com/auth/callback?token=SEU_TOKEN_AQUI&redirect=/payment`
   - Substitua `SEU_TOKEN_AQUI` pelo token copiado
   - Se funcionar: você será redirecionado para `/payment` já autenticado ✅
   - Se não funcionar: será redirecionado para login ❌

### Resultado Esperado
✅ Token válido → Redireciona para `/payment` autenticado  
❌ Token inválido → Redireciona para login

---

## 🧪 Teste 2: Criação de Usuário (Signup) 323 Network → American Dream

### Objetivo
Verificar se ao criar conta no 323 Network, o usuário é criado automaticamente no American Dream.

### Passos

1. **Criar nova conta no 323 Network:**
   - Acesse: `https://323network.com/register`
   - Preencha o formulário:
     - Nome: Teste SSO
     - Sobrenome: Usuario
     - Email: **teste.sso.323@example.com** (use um email novo)
     - Telefone: +1 555 123 4567
     - Senha: uma senha de teste
   - Clique em "Criar Conta"

2. **Verificar no 323 Network:**
   - Confirme que o usuário foi criado
   - Verifique se o profile foi criado com o campo `phone`

3. **Verificar no American Dream:**
   - Acesse o Dashboard do Supabase do American Dream
   - Vá em: Authentication > Users
   - Procure pelo email: `teste.sso.323@example.com`
   - Verifique se o usuário foi criado ✅

4. **Verificar Lead no American Dream:**
   - Vá em: Table Editor > `leads`
   - Procure pelo email: `teste.sso.323@example.com`
   - Verifique se:
     - Lead foi criado ✅
     - `user_id` está preenchido ✅
     - `phone` está preenchido ✅
     - `status_geral` = 'novo' ✅

### Resultado Esperado
✅ Usuário criado no 323 Network  
✅ Usuário criado no American Dream (auth.users)  
✅ Lead criado no American Dream (leads)  
✅ Mesma senha funciona em ambos os sistemas

---

## 🧪 Teste 3: Login e Navegação Automática

### Objetivo
Verificar se ao fazer login no 323 Network, é possível navegar para o American Dream sem redigitar senha.

### Passos

1. **Fazer login no 323 Network:**
   - Acesse: `https://323network.com/login`
   - Faça login com a conta criada no Teste 2

2. **Navegar para American Dream:**
   - No menu do usuário (canto superior direito), clique em "American Dream"
   - OU acesse diretamente: `https://americandream.com/auth/callback?token=TOKEN&redirect=/payment`
   - (O token será adicionado automaticamente pelo botão)

3. **Verificar resultado:**
   - Se funcionar: você será redirecionado para `/payment` já autenticado ✅
   - Se não funcionar: será redirecionado para login ❌

### Resultado Esperado
✅ Login no 323 Network  
✅ Navegação para American Dream sem redigitar senha  
✅ Autenticado automaticamente no American Dream

---

## 🧪 Teste 4: Login no American Dream → Redirecionar para 323 Network

### Objetivo
Verificar se ao fazer login no American Dream, é possível acessar o 323 Network.

### Passos

1. **Fazer login no American Dream:**
   - Acesse: `https://americandream.com/login`
   - Use as mesmas credenciais do Teste 2
   - Faça login

2. **Verificar token:**
   - Abra DevTools (F12) > Console
   - Execute:
   ```javascript
   const session = await window.supabase.auth.getSession()
   console.log('Token:', session.data.session?.access_token)
   ```

3. **Acessar 323 Network com token:**
   - Acesse: `https://323network.com/auth/callback?token=TOKEN_AQUI&redirect=/`
   - Substitua `TOKEN_AQUI` pelo token copiado

### Resultado Esperado
✅ Token do American Dream é válido no 323 Network  
✅ Redireciona para home já autenticado

---

## 🧪 Teste 5: Prevenção de Loops

### Objetivo
Verificar se a flag `source` previne loops infinitos de sincronização.

### Passos

1. **Verificar user_metadata:**
   - No Dashboard do Supabase (323 Network)
   - Vá em: Authentication > Users
   - Abra um usuário criado via signup
   - Verifique `user_metadata`:
     - Deve ter `source: '323-network'` ✅

2. **Verificar no American Dream:**
   - No Dashboard do Supabase (American Dream)
   - Vá em: Authentication > Users
   - Abra o mesmo usuário (mesmo email)
   - Verifique `user_metadata`:
     - Deve ter `source: '323-network'` ✅

3. **Testar Edge Function manualmente:**
   - Se tentar criar o mesmo usuário novamente, deve retornar "já existe" ✅

### Resultado Esperado
✅ Flag `source` está presente no user_metadata  
✅ Edge Functions verificam a flag antes de sincronizar  
✅ Não há loops infinitos

---

## 🧪 Teste 6: Senha Funciona em Ambos os Sistemas

### Objetivo
Verificar se a mesma senha funciona em ambos os sistemas.

### Passos

1. **Login no 323 Network:**
   - Acesse: `https://323network.com/login`
   - Use: `teste.sso.323@example.com` / senha do Teste 2
   - Deve fazer login com sucesso ✅

2. **Login no American Dream:**
   - Acesse: `https://americandream.com/login`
   - Use: `teste.sso.323@example.com` / mesma senha
   - Deve fazer login com sucesso ✅

### Resultado Esperado
✅ Mesma senha funciona no 323 Network  
✅ Mesma senha funciona no American Dream

---

## 🔍 Verificações Adicionais

### Verificar Logs das Edge Functions

1. **No Dashboard do Supabase (323 Network):**
   - Vá em: Edge Functions > `sync-user-to-american-dream` > Logs
   - Verifique se há erros ou sucessos

2. **Verificar se secrets estão configurados:**
   - Vá em: Edge Functions > Secrets
   - Verifique se existem:
     - `AMERICAN_DREAM_URL` ✅
     - `AMERICAN_DREAM_SERVICE_ROLE_KEY` ✅

---

## ❌ Troubleshooting

### Problema: Token não é válido no outro sistema

**Possíveis causas:**
1. JWT Secret não foi configurado corretamente
2. Access Token Expiry diferente entre projetos
3. Token expirado

**Solução:**
- Verificar se ambos os projetos têm o mesmo Legacy JWT Secret
- Verificar se Access Token Expiry é `604800` em ambos
- Gerar novo token fazendo login novamente

### Problema: Usuário não é criado no outro sistema

**Possíveis causas:**
1. Edge Function não está sendo chamada
2. Secrets não estão configurados
3. Erro na Edge Function

**Solução:**
- Verificar logs da Edge Function
- Verificar se secrets estão configurados
- Verificar console do navegador para erros

### Problema: Loop infinito de criação

**Possíveis causas:**
1. Flag `source` não está sendo verificada
2. Edge Function não está verificando a flag

**Solução:**
- Verificar user_metadata do usuário
- Verificar código da Edge Function

---

## ✅ Checklist Final

- [ ] Teste 1: Validação de Token JWT ✅/❌
- [ ] Teste 2: Criação de Usuário ✅/❌
- [ ] Teste 3: Login e Navegação Automática ✅/❌
- [ ] Teste 4: Login American Dream → 323 Network ✅/❌
- [ ] Teste 5: Prevenção de Loops ✅/❌
- [ ] Teste 6: Senha Funciona em Ambos ✅/❌

---

## 📝 Notas

- Use emails de teste únicos para cada teste
- Limpe dados de teste após validar
- Verifique logs das Edge Functions em caso de erro
- Tokens expiram em 7 dias (604800 segundos)

