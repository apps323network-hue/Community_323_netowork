# 🔐 Plano de Implementação - SSO entre 323 Network e American Dream

## 📋 Situação Atual

- ✅ **323 Network**: Projeto Supabase (organização/conta própria)
- ✅ **American Dream**: Projeto Supabase (organização/conta diferente)
- 🎯 **Objetivo**: Autenticação compartilhada (SSO) entre os dois sistemas
- ⚠️ **Desafio**: Projetos Supabase separados = não podem usar o mesmo projeto de Auth diretamente

---

## 🔍 Informações Necessárias (Antes de Começar)

### **1. Detalhes dos Projetos Supabase**

Precisamos coletar as seguintes informações de **ambos os projetos**:

#### **323 Network:**
- [ ] Project ID (ref)
- [ ] Organization ID
- [ ] Project URL (https://xxxxx.supabase.co)
- [ ] Anon Key (chave pública)
- [ ] Service Role Key (chave privada - para validação server-side)
- [ ] JWT Secret (chave secreta JWT do projeto)
- [ ] Configurações de Auth atuais (email, OAuth, etc.)

#### **American Dream:**
- [ ] Project ID (ref)
- [ ] Organization ID
- [ ] Project URL (https://xxxxx.supabase.co)
- [ ] Anon Key (chave pública)
- [ ] Service Role Key (chave privada - para validação server-side)
- [ ] JWT Secret (chave secreta JWT do projeto)
- [ ] Configurações de Auth atuais (email, OAuth, etc.)

### **2. Configurações de Domínio**

- [ ] Domínio do 323 Network (ex: 323network.com)
- [ ] Subdomínio do American Dream (ex: americandream.323network.com)
- [ ] URLs de redirecionamento configuradas em cada projeto
- [ ] Configurações de CORS (se necessário)

### **3. Estrutura de Usuários Atual**

#### **323 Network:**
- [ ] Quantos usuários existem atualmente?
- [ ] Estrutura da tabela `profiles` (quais campos?)
- [ ] Há dados sensíveis que não devem ser compartilhados?
- [ ] Quais roles/permissões existem?

#### **American Dream:**
- [ ] Quantos usuários existem atualmente?
- [ ] Estrutura da tabela de usuários/perfis
- [ ] Há dados sensíveis que não devem ser compartilhados?
- [ ] Quais roles/permissões existem?

---

## 🛠️ Opções Técnicas para SSO

### **Opção 1: JWT Tokens Compartilhados (Recomendada)**

**Como Funciona:**
- Configurar ambos os projetos Supabase para usar a **mesma chave secreta JWT**
- Token gerado no 323 Network pode ser validado no American Dream (e vice-versa)
- Cada sistema mantém seu próprio banco de dados, apenas autenticação compartilhada

**Vantagens:**
- ✅ Implementação relativamente simples
- ✅ Não requer infraestrutura adicional
- ✅ Performance boa (validação local)
- ✅ Seguro (JWT assinado)

**Desvantagens:**
- ⚠️ Requer acesso a JWT Secret de ambos os projetos
- ⚠️ Se um projeto mudar a chave, precisa atualizar o outro
- ⚠️ Precisa sincronizar configurações de Auth entre projetos

**Implementação:**
1. Obter JWT Secret de ambos os projetos
2. Escolher uma chave comum (ou usar uma das existentes)
3. Configurar ambos os projetos para usar a mesma chave
4. Criar middleware de validação de token entre sistemas
5. Implementar redirecionamento com token

---

### **Opção 2: Serviço de Autenticação Centralizado**

**Como Funciona:**
- Criar um serviço/API separado que gerencia autenticação
- Ambos os sistemas consultam esse serviço para validar tokens
- Pode usar Supabase Auth de um dos projetos como "master"

**Vantagens:**
- ✅ Controle centralizado de autenticação
- ✅ Facilita adicionar mais sistemas no futuro
- ✅ Mais flexível para mudanças

**Desvantagens:**
- ⚠️ Requer infraestrutura adicional
- ⚠️ Mais complexo de implementar
- ⚠️ Pode adicionar latência

**Implementação:**
1. Criar Edge Function ou serviço separado
2. Configurar como ponto central de autenticação
3. Ambos os sistemas consultam esse serviço
4. Implementar cache para performance

---

### **Opção 3: OAuth 2.0 / OIDC entre Sistemas**

**Como Funciona:**
- Um sistema (ex: 323 Network) atua como provedor OAuth
- Outro sistema (American Dream) atua como cliente OAuth
- Usuário faz login no 323 Network e recebe token
- American Dream valida token com 323 Network

**Vantagens:**
- ✅ Padrão da indústria
- ✅ Muito seguro
- ✅ Escalável

**Desvantagens:**
- ⚠️ Mais complexo de implementar
- ⚠️ Requer configuração OAuth em ambos os lados
- ⚠️ Pode ser overkill para dois sistemas

**Implementação:**
1. Configurar 323 Network como OAuth Provider
2. Configurar American Dream como OAuth Client
3. Implementar fluxo OAuth completo
4. Gerenciar tokens e refresh tokens

---

## 🎯 Recomendação: Opção 1 (JWT Compartilhado)

Para o caso de uso atual (dois sistemas Supabase), a **Opção 1** é a mais adequada porque:
- ✅ Mais simples de implementar
- ✅ Não requer infraestrutura adicional
- ✅ Performance excelente
- ✅ Segura o suficiente para o caso de uso

---

## 📝 Plano de Implementação Passo a Passo

### **Fase 1: Coleta de Informações** ⏱️ 1-2 dias

1. **Acessar Dashboard do 323 Network:**
   - [ ] Settings > API > Copiar Project URL, Anon Key, Service Role Key
   - [ ] Settings > Auth > Verificar configurações atuais
   - [ ] Settings > API > Verificar JWT Secret (pode precisar gerar nova chave)
   - [ ] Verificar URLs de redirecionamento configuradas

2. **Acessar Dashboard do American Dream:**
   - [ ] Settings > API > Copiar Project URL, Anon Key, Service Role Key
   - [ ] Settings > Auth > Verificar configurações atuais
   - [ ] Settings > API > Verificar JWT Secret (pode precisar gerar nova chave)
   - [ ] Verificar URLs de redirecionamento configuradas

3. **Analisar Estrutura de Dados:**
   - [ ] Exportar schema da tabela `profiles` do 323 Network
   - [ ] Exportar schema da tabela de usuários do American Dream
   - [ ] Identificar campos comuns e diferenças
   - [ ] Documentar estrutura atual

---

### **Fase 2: Configuração de JWT Compartilhado** ⏱️ 2-3 dias

1. **Decidir Estratégia de Chave:**
   - [ ] Opção A: Usar JWT Secret do 323 Network (projeto principal)
   - [ ] Opção B: Gerar nova chave compartilhada e configurar em ambos
   - [ ] **Recomendação**: Opção A (usar chave do 323 Network)

2. **Configurar 323 Network:**
   - [ ] Verificar JWT Secret atual
   - [ ] Documentar configurações de Auth
   - [ ] Adicionar URL do American Dream nas URLs de redirecionamento permitidas

3. **Configurar American Dream:**
   - [ ] **IMPORTANTE**: Atualizar JWT Secret para ser igual ao do 323 Network
   - [ ] ⚠️ **ATENÇÃO**: Isso pode invalidar tokens existentes do American Dream
   - [ ] Adicionar URL do 323 Network nas URLs de redirecionamento permitidas
   - [ ] Testar que Auth ainda funciona após mudança

4. **Validar Configuração:**
   - [ ] Gerar token no 323 Network
   - [ ] Tentar validar token no American Dream
   - [ ] Gerar token no American Dream
   - [ ] Tentar validar token no 323 Network
   - [ ] Verificar que ambos funcionam

---

### **Fase 3: Implementação do Middleware** ⏱️ 3-5 dias

1. **Criar Função de Validação de Token:**
   - [ ] Criar Edge Function ou utilitário que valida tokens de ambos os sistemas
   - [ ] Implementar validação de JWT
   - [ ] Verificar assinatura do token
   - [ ] Verificar expiração
   - [ ] Retornar dados do usuário se válido

2. **Implementar no 323 Network:**
   - [ ] Criar endpoint/middleware para validar tokens do American Dream
   - [ ] Adicionar lógica de redirecionamento com token
   - [ ] Testar fluxo completo

3. **Implementar no American Dream:**
   - [ ] Criar endpoint/middleware para validar tokens do 323 Network
   - [ ] Adicionar botão "Login com 323 Network"
   - [ ] Implementar redirecionamento para 323 Network
   - [ ] Implementar callback que recebe token e valida
   - [ ] Criar sessão local após validação
   - [ ] Testar fluxo completo

---

### **Fase 4: Interface de Usuário** ⏱️ 2-3 dias

1. **No 323 Network:**
   - [ ] Adicionar opção "Acessar American Dream" (se necessário)
   - [ ] Implementar redirecionamento com token
   - [ ] Testar UX

2. **No American Dream:**
   - [ ] Criar botão "Login com 323 Network"
   - [ ] Adicionar na página de login
   - [ ] Implementar fluxo visual (loading, feedback)
   - [ ] Adicionar mensagens de erro amigáveis
   - [ ] Testar UX

---

### **Fase 5: Sincronização de Dados (Opcional)** ⏱️ 2-3 dias

1. **Decidir Estratégia:**
   - [ ] Opção A: Apenas autenticação compartilhada (dados separados)
   - [ ] Opção B: Sincronizar dados básicos do usuário (nome, email, etc.)
   - [ ] **Recomendação inicial**: Opção A (apenas auth)

2. **Se escolher Opção B:**
   - [ ] Criar função para sincronizar dados básicos
   - [ ] Implementar após login bem-sucedido
   - [ ] Garantir que dados sensíveis não sejam compartilhados

---

### **Fase 6: Testes e Validação** ⏱️ 2-3 dias

1. **Testes Funcionais:**
   - [ ] Login no 323 Network → Acesso ao American Dream
   - [ ] Login no American Dream → Acesso ao 323 Network (se necessário)
   - [ ] Logout em um sistema → Verificar comportamento no outro
   - [ ] Token expirado → Redirecionar para login
   - [ ] Usuário novo no 323 Network → Criar no American Dream (se necessário)

2. **Testes de Segurança:**
   - [ ] Validar que tokens não podem ser falsificados
   - [ ] Verificar que dados não são compartilhados indevidamente
   - [ ] Testar cenários de ataque (token inválido, expirado, etc.)

3. **Testes de Performance:**
   - [ ] Medir latência de validação de token
   - [ ] Testar com múltiplos usuários simultâneos
   - [ ] Verificar que não há impacto negativo na performance

---

## 🔧 Ferramentas e Recursos Necessários

### **Acesso Necessário:**
- [ ] Acesso ao Dashboard do 323 Network (Settings, API, Auth)
- [ ] Acesso ao Dashboard do American Dream (Settings, API, Auth)
- [ ] Acesso ao código fonte de ambos os projetos
- [ ] Acesso aos bancos de dados (para análise de estrutura)

### **Documentação Útil:**
- [ ] Documentação do Supabase Auth
- [ ] Documentação de JWT
- [ ] Documentação de CORS (se necessário)

---

## ⚠️ Pontos de Atenção e Riscos

### **Riscos Identificados:**

1. **Mudança de JWT Secret no American Dream:**
   - ⚠️ Pode invalidar todos os tokens existentes
   - ✅ **Mitigação**: Avisar usuários antes, ou migrar gradualmente

2. **Dados Sensíveis:**
   - ⚠️ Garantir que apenas autenticação seja compartilhada
   - ✅ **Mitigação**: Validar que dados permanecem separados

3. **Performance:**
   - ⚠️ Validação de token pode adicionar latência
   - ✅ **Mitigação**: Implementar cache de validação

4. **Segurança:**
   - ⚠️ Tokens compartilhados = maior superfície de ataque
   - ✅ **Mitigação**: Usar HTTPS, validar tokens corretamente, expiração curta

---

## 📊 Checklist de Início

Antes de começar a implementação, você precisa ter:

- [ ] ✅ Acesso ao Dashboard do 323 Network
- [ ] ✅ Acesso ao Dashboard do American Dream
- [ ] ✅ Project IDs, URLs e Keys de ambos os projetos
- [ ] ✅ JWT Secrets de ambos os projetos
- [ ] ✅ Entendimento da estrutura de dados atual
- [ ] ✅ Decisão sobre estratégia (Opção 1, 2 ou 3)
- [ ] ✅ Ambiente de desenvolvimento/teste configurado

---

## 🚀 Próximos Passos Imediatos

1. **Coletar Informações:**
   - Acessar ambos os Dashboards do Supabase
   - Documentar todas as informações necessárias
   - Criar documento com credenciais (mantê-lo seguro!)

2. **Decidir Estratégia:**
   - Revisar as 3 opções técnicas
   - Escolher a melhor para o caso de uso
   - **Recomendação**: Opção 1 (JWT Compartilhado)

3. **Criar Ambiente de Teste:**
   - Configurar ambiente de desenvolvimento
   - Criar branch para desenvolvimento do SSO
   - Preparar para testes

---

## 📝 Notas Técnicas

### **Como Obter JWT Secret no Supabase:**

1. Acesse o Dashboard do projeto
2. Vá em **Settings** > **API**
3. Procure por **JWT Secret** (pode estar em **JWT Settings**)
4. ⚠️ Se não encontrar, pode ser necessário:
   - Usar a Service Role Key para gerar tokens
   - Ou configurar uma nova chave compartilhada

### **Estrutura de Token JWT do Supabase:**

```json
{
  "aud": "authenticated",
  "exp": 1234567890,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated"
}
```

### **Validação de Token:**

```typescript
// Pseudocódigo
function validateToken(token: string, jwtSecret: string) {
  // Decodificar e verificar assinatura
  // Verificar expiração
  // Retornar dados do usuário
}
```

---

**Status**: 📋 Plano criado - Pronto para coleta de informações  
**Próxima Ação**: Coletar informações dos dois projetos Supabase

