# 🚀 Guia Completo: Integração American Dream ↔ 323 Network

**Use este documento para conversar com o Cursor do projeto American Dream**

---

## 📋 PROMPT INICIAL (Cole Primeiro)

```
Olá! Estou trabalhando na integração do American Dream com o 323 Network para implementar um sistema de Single Sign-On (SSO).

### Situação Atual
- Ambos os projetos usam Supabase
- Já compartilham o mesmo JWT Secret (já configurado)
- Já existe sincronização automática de usuários (323 Network → American Dream)

### O Que Precisamos Implementar
Queremos criar um fluxo de registro integrado onde:
1. Aluno se registra no American Dream
2. É redirecionado para 323 Network (com tracking de origem)
3. Completa registro na 323 Network (email confirmado automaticamente)
4. É redirecionado de volta para American Dream (com token JWT)
5. Vai direto para página de pagamento (já autenticado)

Vou fazer algumas perguntas para entender a estrutura atual do American Dream. Pode responder?
```

---

## 🎯 CONTEXTO COMPLETO DO FLUXO DESEJADO

### O Que Queremos Implementar

Estamos implementando um **Single Sign-On (SSO)** entre os projetos **American Dream** e **323 Network**. Ambos usam Supabase e agora compartilham o mesmo JWT Secret.

### Fluxo Completo do Registro

```
1. Aluno preenche formulário de registro no American Dream
   ↓
2. American Dream NÃO cria usuário diretamente
   ↓
3. American Dream redireciona para 323 Network com parâmetros:
   URL: https://323network.com/login?source=american-dream&returnTo=[URL_ENCODED]&email=[EMAIL]&name=[NAME]&phone=[PHONE]&phoneCountryCode=[CODE]
   
   Onde:
   - source=american-dream (identifica origem)
   - returnTo=URL da página de pagamento do American Dream (ex: https://americandream.com/payment)
   ↓
4. Aluno preenche formulário de registro na 323 Network
   (pode pré-preencher campos se passados via URL)
   ↓
5. 323 Network detecta source=american-dream
   ↓
6. 323 Network cria usuário COM email já confirmado automaticamente
   (sem precisar clicar no link de confirmação)
   ↓
7. 323 Network sincroniza usuário com American Dream
   (cria usuário e lead no American Dream automaticamente)
   ↓
8. 323 Network redireciona de volta para American Dream:
   URL: {returnTo}?token=[JWT_TOKEN]
   
   Exemplo: https://americandream.com/payment?token=eyJhbGciOiJIUzI1NiIs...
   ↓
9. American Dream recebe token na URL
   ↓
10. American Dream autentica usuário usando o token JWT
    (usa supabase.auth.setSession() com o token)
   ↓
11. American Dream verifica/cria lead na tabela 'leads'
   ↓
12. Aluno vai direto para página de métodos de pagamento
    (já autenticado, sem precisar fazer login)
```

### Por Que Este Fluxo?

1. **Unificação de contas**: Um único registro funciona em ambos os sistemas
2. **Experiência fluida**: Aluno não precisa confirmar email duas vezes
3. **Redirecionamento automático**: Volta direto para onde estava (página de pagamento)
4. **Sincronização automática**: Dados são sincronizados entre os dois sistemas

### O Que Precisa Ser Feito no American Dream

1. **Modificar formulário de registro**:
   - Ao invés de criar usuário diretamente, redirecionar para 323 Network
   - Passar dados via query parameters ou state

2. **Criar/Modificar página de callback**:
   - Receber token JWT via URL
   - Autenticar usuário usando `supabase.auth.setSession()`
   - Verificar/criar lead na tabela `leads`
   - Redirecionar para página de pagamento

3. **Página de pagamento**:
   - Verificar se usuário está autenticado
   - Se não estiver, verificar se há token na URL e autenticar

---

## 📋 PERGUNTAS PARA FAZER AO CURSOR

### 1. URLs e Domínios

**Pergunta 1:**
```
Qual é a URL de produção do American Dream? 
✅ RESPOSTA: https://americandream.323network.com/

📌 Informações da 323 Network (para referência):
- URL de produção: https://323network.com/
- URL de login/registro: https://323network.com/login?redirect=/
- Nota: A 323 Network usa a mesma rota /login para login e registro
```

**Pergunta 2:**
```
Qual é a rota/URL da página de métodos de pagamento?
✅ RESPOSTA: /payment-options
Arquivo: src/pages/PaymentOptions.tsx
```

**Pergunta 3:**
```
Qual é a rota/URL da página de registro/cadastro atual?
✅ RESPOSTA: /lead-form
Arquivo: src/pages/LeadForm.tsx
```

---

### 2. Formulário de Registro

**Pergunta 4:**
```
Onde está o componente/formulário de registro no código?
Qual é o caminho do arquivo?
```

**Pergunta 5:**
```
Quais campos o formulário de registro coleta?
Liste todos os campos: email, senha, nome, telefone, etc.
```

**Pergunta 6:**
```
Quais campos são obrigatórios e quais são opcionais?
```

**Pergunta 7:**
```
Quais validações existem no formulário?
Exemplo: senha mínimo 6 caracteres, formato de email, etc.
```

**Pergunta 8:**
```
Como funciona o submit do formulário? 
O que acontece quando o usuário clica em "Registrar"?
```

---

### 3. Estrutura de Dados - Tabela Leads

**Pergunta 9:**
```
Qual é a estrutura completa da tabela 'leads'?
Quais são todos os campos e seus tipos?
```

**Pergunta 10:**
```
Quais campos da tabela 'leads' são obrigatórios (NOT NULL)?
```

**Pergunta 11:**
```
Como o lead é criado atualmente?
É criado manualmente no código ou existe algum trigger/função automática?
```

**Pergunta 12:**
```
O campo 'name' na tabela 'leads' armazena nome completo ou existe 'first_name' e 'last_name' separados?
```

**Pergunta 13:**
```
Qual é o formato esperado do campo 'phone'?
Exemplo: apenas números, com código do país, etc.
```

---

### 4. Autenticação e Sessão

**Pergunta 14:**
```
O American Dream usa Supabase Auth para autenticação?
```

**Pergunta 15:**
```
Como o sistema gerencia sessões de usuário?
Usa tokens JWT? Como armazena?
```

**Pergunta 16:**
```
Existe alguma rota de callback para receber tokens de autenticação?
Exemplo: /auth/callback
```

**Pergunta 17:**
```
Como o sistema processa tokens JWT recebidos via URL?
Existe algum código que faz isso?
```

**Pergunta 18:**
```
A página de pagamento verifica se o usuário está autenticado?
Como faz essa verificação?
```

---

### 5. Service Role Key e Configurações

**Pergunta 19:**
```
A Service Role Key do Supabase já foi atualizada após a mudança do JWT Secret?
Onde ela está configurada? (variáveis de ambiente, secrets, etc.)
```

**Pergunta 20:**
```
Quais Edge Functions existem no projeto e quais usam Service Role Key?
```

---

### 6. Fluxo Atual de Registro

**Pergunta 21:**
```
Atualmente, quando um usuário se registra, o que acontece?
Passo a passo do fluxo atual.
```

**Pergunta 22:**
```
Após o registro, para onde o usuário é redirecionado?
```

**Pergunta 23:**
```
O usuário precisa confirmar email antes de acessar o sistema?
```

---

## ⚡ PERGUNTAS ESSENCIAIS (Prioridade)

Se tiver pouco tempo, faça estas primeiro:

1. ✅ **URL de produção do American Dream**
2. ✅ **URL da página de pagamento** (ex: /payment)
3. ✅ **URL da página de registro** (ex: /register)
4. ✅ **Onde está o arquivo do formulário de registro?**
5. ✅ **Quais campos o formulário coleta?** (email, senha, nome, telefone, etc.)
6. ✅ **Quais campos são obrigatórios?**
7. ✅ **Quais são todos os campos da tabela 'leads'?**
8. ✅ **Quais campos da tabela 'leads' são obrigatórios?**
9. ✅ **O campo 'name' é nome completo ou tem 'first_name'/'last_name'?**
10. ✅ **Usa Supabase Auth?**
11. ✅ **Existe rota de callback?** (ex: /auth/callback)
12. ✅ **Como processa tokens JWT recebidos via URL?**

---

## 📝 Como Usar Este Documento

1. **Cole o PROMPT INICIAL** no Cursor do American Dream como primeira mensagem
2. **Faça as perguntas uma por vez** (é mais eficiente)
3. **Cole as respostas** em um documento separado
4. **Me envie as respostas** para eu implementar no 323 Network

---

## 💡 Dicas

- **Copie e cole as perguntas** diretamente no chat
- **Peça exemplos de código** quando relevante
- **Peça caminhos de arquivos** para entender a estrutura
- **Se não souber algo**, peça para o Cursor buscar no código

---

**Última atualização**: 2026-01-02

