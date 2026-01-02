# ✅ Respostas Coletadas do American Dream

**Data**: 2026-01-02  
**Fonte**: Cursor do projeto American Dream

---

## 🌐 URLs e Informações da 323 Network

**URL de produção**: `https://323network.com/`  
**URL de login/registro**: `https://323network.com/login?redirect=/`  
**Nota**: A 323 Network usa a mesma rota `/login` para login e registro (com toggle entre os dois modos).

---

## 📊 Informações Coletadas

### 1. URLs e Domínios

✅ **URL de produção**: `https://americandream.323network.com/`

✅ **Rota da página de pagamento**: `/payment-options`
- Arquivo: `src/pages/PaymentOptions.tsx`
- URL completa: `https://americandream.323network.com/payment-options?lead_id={UUID}&term_acceptance_id={UUID}&country={BR|US}`

✅ **Rota da página de registro**: `/lead-form`
- Arquivo: `src/pages/LeadForm.tsx`

---

### 2. Formulário de Registro

✅ **Arquivo**: `src/pages/LeadForm.tsx`
✅ **Componente**: `LeadForm`

**Campos coletados:**
1. `name` (Nome Completo) — **obrigatório**
2. `email` — **obrigatório**
3. `phone` (Telefone) — **obrigatório**
4. `phoneCountryCode` (Código do país) — **obrigatório**, padrão "BR"
5. `termsAccepted` (Aceitar termos) — **obrigatório** (checkbox)

**Validações:**
- Email: formato válido (Zod)
- Telefone: validação com `libphonenumber-js` baseada no país
- Nome: não vazio
- Termos: deve estar aceito

**O que acontece no submit atual:**
1. Valida formulário
2. Formata telefone com código do país
3. Insere lead na tabela `leads`
4. Registra aceitação de termos
5. Gera PDF do contrato em background
6. Detecta país por IP
7. Redireciona para `/payment-options` com parâmetros

---

### 3. Estrutura da Tabela `leads`

**Campos:**
```typescript
{
  id: UUID (PRIMARY KEY)
  name: string (Nome completo) // NOT NULL
  email: string // NOT NULL
  phone: string (Formato internacional: +55 11 98765-4321) // NOT NULL
  country_code: string | null (Código do país, ex: "+55")
  created_at: TIMESTAMPTZ // NOT NULL
  status_geral: string | null
  user_id: UUID | null (FK para auth.users - pode ser null)
}
```

**Campos obrigatórios (NOT NULL):**
- `id` (gerado automaticamente)
- `name`
- `email`
- `phone`
- `created_at` (gerado automaticamente)

**Observações:**
- `name` armazena nome completo (não há `first_name`/`last_name` separados)
- `phone` formato: internacional com código do país (ex: `+55 11 98765-4321`)
- `user_id` pode ser `null` (não obrigatório)
- Lead é criado manualmente no código (não há triggers automáticos)

---

### 4. Autenticação e Sessão

✅ **Usa Supabase Auth**: Sim
- Cliente: `src/lib/supabase.ts`

✅ **Gerenciamento de sessão**:
- Usa tokens JWT do Supabase
- Armazenamento: gerenciado pelo cliente Supabase
- Verificação: `supabase.auth.getSession()` e `supabase.auth.onAuthStateChange()`

❌ **Rota de callback**: Não existe
- Não há `/auth/callback` no código atual
- Não processa tokens JWT de autenticação via URL

❌ **Página de pagamento verifica autenticação**: Não
- Funciona apenas com `lead_id` e `term_acceptance_id` na URL
- Não requer login

---

### 5. Service Role Key

⚠️ **Status**: Precisa ser atualizada
- Onde está: secrets das Edge Functions no Dashboard
- Edge Functions que usam: 11 funções listadas

---

### 6. Fluxo Atual de Registro

**Passo a passo atual:**
1. Usuário preenche `/lead-form`
2. Submit valida e formata telefone
3. Insere lead na tabela `leads` (sem criar usuário no Supabase Auth)
4. Registra aceitação de termos
5. Gera PDF do contrato em background
6. Detecta país por IP
7. Redireciona para `/payment-options` com parâmetros

**Observações importantes:**
- ❌ **NÃO cria usuário no Supabase Auth** no registro atual
- ❌ **NÃO há confirmação de email**
- ✅ Lead é criado diretamente na tabela `leads` sem autenticação
- ✅ `user_id` pode ser vinculado depois quando usuário for autenticado

---

## 🎯 O Que Precisa Ser Implementado

### No American Dream:

1. **Modificar `LeadForm.tsx`**:
   - Ao invés de criar lead diretamente, redirecionar para 323 Network
   - Passar dados via query parameters

2. **Criar rota de callback `/auth/callback`**:
   - Receber token JWT via URL
   - Autenticar usuário com `supabase.auth.setSession()`
   - Buscar ou criar lead vinculado ao `user_id`
   - Redirecionar para `/payment-options`

3. **Modificar `PaymentOptions.tsx`**:
   - Verificar se há token na URL
   - Se houver, autenticar antes de mostrar a página
   - Vincular lead ao `user_id` se ainda não estiver vinculado

---

## 📝 Próximos Passos

1. ✅ Informações coletadas
2. ⏳ Implementar no 323 Network (detectar source, auto-confirmar email, redirecionar)
3. ⏳ Implementar no American Dream (redirecionar, callback, vincular lead)

---

**Última atualização**: 2026-01-02

