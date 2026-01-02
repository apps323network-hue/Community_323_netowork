# 🔧 SETUP SUPABASE - Variáveis de Ambiente

## 📋 Variáveis Necessárias

O projeto precisa das seguintes variáveis de ambiente do Supabase:

### 1. `VITE_SUPABASE_URL`
- **Descrição**: URL do seu projeto Supabase
- **Formato**: `https://xxxxxxxxxxxxx.supabase.co`
- **Onde encontrar**: 
  - Supabase Dashboard > Settings > API > Project URL

### 2. `VITE_SUPABASE_ANON_KEY`
- **Descrição**: Chave pública/anônima do Supabase (segura para usar no frontend)
- **Formato**: String longa (JWT)
- **Onde encontrar**: 
  - Supabase Dashboard > Settings > API > anon public key

---

## 🚀 Como Configurar

### Passo 1: Criar arquivo `.env.local`

Na raiz do projeto, crie um arquivo chamado `.env.local`:

```bash
# Windows (PowerShell)
New-Item -Path .env.local -ItemType File

# Linux/Mac
touch .env.local
```

### Passo 2: Adicionar as variáveis

Abra o arquivo `.env.local` e adicione:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### Passo 3: Obter credenciais do Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Passo 4: Reiniciar o servidor de desenvolvimento

Após adicionar as variáveis, reinicie o Vite:

```bash
# Parar o servidor (Ctrl + C)
# Iniciar novamente
npm run dev
```

---

## ⚠️ Importante

- ✅ O arquivo `.env.local` está no `.gitignore` (não será commitado)
- ✅ Use `.env.example` como referência (pode ser commitado)
- ✅ **NUNCA** commite o arquivo `.env.local` com credenciais reais
- ✅ A chave `anon` é segura para usar no frontend (tem permissões limitadas)

---

## 🔍 Verificação

Após configurar, o erro deve desaparecer. Se ainda aparecer:

1. Verifique se o arquivo está na raiz do projeto
2. Verifique se as variáveis começam com `VITE_` (obrigatório no Vite)
3. Verifique se não há espaços extras ou aspas desnecessárias
4. Reinicie o servidor de desenvolvimento

---

## 📝 Exemplo Completo

```env
# .env.local
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=[OBTER_NO_DASHBOARD_SUPABASE]
```

---

**Status**: ✅ Arquivo `.env.example` criado  
**Próximo passo**: Preencher `.env.local` com suas credenciais reais

