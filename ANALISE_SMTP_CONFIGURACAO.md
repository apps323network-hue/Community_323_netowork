# 📧 Análise do Serviço SMTP - Configuração para admin@323network.com

## 📋 Situação Atual

### Configuração Atual do SMTP

O serviço de email está configurado através de uma **Edge Function** do Supabase chamada `send-email`, localizada em:
- **Arquivo**: `supabase/functions/send-email/index.ts`

### Variáveis de Ambiente Atuais (Supabase Secrets)

As seguintes variáveis estão configuradas no Supabase Dashboard (Settings > Edge Functions > Secrets):

1. **`SMTP_HOST`** - Servidor SMTP
   - Atual: Provavelmente `smtp.gmail.com` (para Gmail)
   - **Novo**: Depende do provedor de email do domínio `323network.com`

2. **`SMTP_PORT`** - Porta SMTP
   - Atual: Provavelmente `587` (TLS) ou `465` (SSL)
   - **Novo**: Depende do provedor (geralmente `587` para TLS ou `465` para SSL)

3. **`SMTP_USER`** - Usuário do email
   - Atual: `apps323network@gmail.com`
   - **Novo**: `admin@323network.com`

4. **`SMTP_PASS`** - Senha do email
   - Atual: Senha do Gmail (ou App Password)
   - **Novo**: Senha do email `admin@323network.com` (ou App Password se disponível)

5. **`SMTP_FROM_EMAIL`** - Email remetente (opcional)
   - Atual: `apps323network@gmail.com` (ou usa `SMTP_USER` se não definido)
   - **Novo**: `admin@323network.com`

6. **`SMTP_FROM_NAME`** - Nome do remetente (opcional)
   - Atual: `323 Network` (padrão)
   - **Novo**: Pode manter `323 Network` ou alterar se desejar

---

## 🔄 O Que Precisa Ser Alterado

### 1. **Supabase Secrets** (Principal)

Você precisa atualizar as seguintes variáveis no Supabase Dashboard:

**Localização**: Supabase Dashboard > Project Settings > Edge Functions > Secrets

#### Variáveis Obrigatórias:

| Variável | Valor Atual | Novo Valor | Observações |
|----------|-------------|------------|-------------|
| `SMTP_HOST` | `smtp.gmail.com` | **A definir** | Depende do provedor de email |
| `SMTP_PORT` | `587` ou `465` | **A definir** | Geralmente `587` (TLS) ou `465` (SSL) |
| `SMTP_USER` | `apps323network@gmail.com` | `admin@323network.com` | Email completo |
| `SMTP_PASS` | Senha Gmail | **Nova senha** | Senha do novo email ou App Password |
| `SMTP_FROM_EMAIL` | `apps323network@gmail.com` | `admin@323network.com` | Email remetente |

#### Variável Opcional:

| Variável | Valor Atual | Novo Valor | Observações |
|----------|-------------|------------|-------------|
| `SMTP_FROM_NAME` | `323 Network` | `323 Network` | Pode manter ou alterar |

---

## 📝 Informações Necessárias para a Mudança

Para configurar o novo email `admin@323network.com`, você precisará das seguintes informações do seu provedor de email:

### 1. **Servidor SMTP (SMTP_HOST)**
   - Exemplos comuns:
     - **Google Workspace**: `smtp.gmail.com`
     - **Microsoft 365**: `smtp.office365.com`
     - **Outros provedores**: Verificar documentação do provedor
   - **Pergunta**: Qual provedor de email você está usando para o domínio `323network.com`?

### 2. **Porta SMTP (SMTP_PORT)**
   - Geralmente:
     - `587` - Porta TLS (recomendada)
     - `465` - Porta SSL
     - `25` - Porta não criptografada (não recomendada)
   - **Pergunta**: Qual porta o provedor recomenda?

### 3. **Credenciais de Acesso**
   - **Email**: `admin@323network.com`
   - **Senha**: Senha do email ou App Password (se disponível)
   - **Pergunta**: Você já tem a senha configurada? O provedor oferece App Passwords?

### 4. **Autenticação**
   - A maioria dos provedores modernos requer autenticação
   - Alguns podem exigir App Passwords em vez de senha normal
   - **Pergunta**: O provedor requer autenticação especial?

---

## 🔧 Como Fazer a Alteração

### Passo 1: Obter Informações do Provedor de Email

1. Identifique qual provedor está gerenciando o domínio `323network.com`
2. Acesse as configurações de email do provedor
3. Localize as informações de SMTP:
   - Servidor SMTP
   - Porta SMTP
   - Requisitos de autenticação

### Passo 2: Atualizar Secrets no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Project Settings** > **Edge Functions** > **Secrets**
4. Atualize cada variável:

   ```
   SMTP_HOST = [servidor SMTP do seu provedor]
   SMTP_PORT = [porta SMTP, geralmente 587]
   SMTP_USER = admin@323network.com
   SMTP_PASS = [senha do email ou App Password]
   SMTP_FROM_EMAIL = admin@323network.com
   SMTP_FROM_NAME = 323 Network (opcional, pode manter)
   ```

5. Clique em **Save** para cada variável

### Passo 3: Testar a Configuração

Após atualizar os secrets, você pode testar enviando um email através da aplicação. A Edge Function `send-email` usará automaticamente as novas configurações.

---

## 📍 Onde o Email é Usado no Código

### 1. **Edge Function** (`supabase/functions/send-email/index.ts`)
   - ✅ **Não precisa alterar código** - Usa variáveis de ambiente automaticamente
   - A função lê `SMTP_FROM_EMAIL` ou usa `SMTP_USER` como fallback

### 2. **Funções de Email** (`src/lib/emails.ts`)
   - ✅ **Não precisa alterar código** - Usa a Edge Function
   - A função `sendEmail()` passa o `fromName` como parâmetro, mas o email vem das variáveis de ambiente

### 3. **Email de Parceiros** (`src/lib/emails.ts` linha 315)
   - ✅ **ATUALIZADO**: Agora envia para `admin@323network.com`
   - O email hardcoded foi removido e substituído pelo novo email

---

## ⚠️ Pontos de Atenção

### 1. **Email de Destino de Parceiros**
   No arquivo `src/lib/emails.ts`, linha 315, há um email hardcoded:
   ```typescript
   to: 'apps323network@gmail.com',
   ```
   
   **Pergunta**: Você quer alterar este email de destino também para `admin@323network.com`?

### 2. **Templates de Email do Supabase Auth**
   Se você estiver usando templates de email do Supabase para autenticação (confirmação de email, reset de senha), você também precisará configurar o SMTP nas configurações de autenticação do Supabase:
   - **Localização**: Supabase Dashboard > Authentication > Settings > SMTP Settings
   - Isso é separado das Edge Functions

### 3. **DNS e SPF/DKIM**
   Para melhorar a entrega de emails, certifique-se de que o domínio `323network.com` tenha:
   - Registros SPF configurados
   - Registros DKIM configurados
   - Registro DMARC (opcional, mas recomendado)

---

## ✅ Checklist de Migração

- [ ] Identificar provedor de email do domínio `323network.com`
- [ ] Obter servidor SMTP (`SMTP_HOST`)
- [ ] Obter porta SMTP (`SMTP_PORT`)
- [ ] Confirmar credenciais de acesso (`SMTP_USER` e `SMTP_PASS`)
- [ ] Atualizar `SMTP_USER` no Supabase Secrets
- [ ] Atualizar `SMTP_PASS` no Supabase Secrets
- [ ] Atualizar `SMTP_HOST` no Supabase Secrets
- [ ] Atualizar `SMTP_PORT` no Supabase Secrets
- [ ] Atualizar `SMTP_FROM_EMAIL` no Supabase Secrets
- [x] Email de destino de parceiros atualizado para `admin@323network.com` ✅
- [ ] Testar envio de email após alterações
- [ ] Verificar configuração SMTP nas configurações de autenticação do Supabase (se aplicável)

---

## 📞 Próximos Passos

1. **Forneça as informações do provedor de email**:
   - Qual provedor está gerenciando `323network.com`?
   - Servidor SMTP
   - Porta SMTP
   - Se precisa de App Password

2. **Email de parceiros atualizado** ✅:
   - Código atualizado para usar `admin@323network.com`

3. **Após fornecer as informações**, posso:
   - Atualizar o código se necessário (email de destino de parceiros)
   - Criar um guia passo a passo específico para seu provedor
   - Ajudar a testar a configuração

---

**Status**: 
- ✅ Código atualizado para usar `admin@323network.com`
- ⏳ Aguardando informações do provedor de email para configurar os Secrets no Supabase

