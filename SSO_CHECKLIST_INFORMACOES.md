# ✅ Checklist de Informações para SSO - 323 Network & American Dream

## 📋 Status de Coleta de Informações

### **323 Network** ✅ (Quase Completo)

#### **Informações Coletadas:**
- [x] **Project ID**: `pgdvbanwumqjmqeybqnw`
- [x] **Project URL**: `https://pgdvbanwumqjmqeybqnw.supabase.co`
- [x] **Organization ID**: `jkpjsvqezxvfjcwcyhin`
- [x] **Anon Key**: Coletada
- [x] **Publishable Key**: Coletada
- [x] **JWT Key ID (Atual)**: `d2956ee8-1f0e-43bc-bc0f-85435475334f`
- [x] **JWT Secret Key (ECC)**: `[REDACTED]`
- [x] **Estrutura de dados**: Tabela `profiles` mapeada
- [x] **Estatísticas**: 6 usuários, 1 admin

#### **Informações que Ainda Precisam:**
- [x] **Legacy JWT Secret (HS256) - CHAVE ATUAL** ✅ **COLETADO**
  - **Status**: Ainda em uso ("still used")
  - **Secret**: `[REDACTED - Obter no Dashboard > Settings > API > JWT Keys > Legacy JWT Secret]`
  - **Access Token Expiry**: 3600 segundos (1 hora)
  - **⚠️ CRÍTICO**: Esta é a chave que será compartilhada com o American Dream para SSO
  - **Nota**: Foi migrado para novas JWT Signing Keys, mas ainda é usado para verificar tokens

- [x] **Service Role Key** ✅
  - **Status**: Coletada e armazenada
  - **⚠️ SEGREDO**: Manter em segredo, nunca expor no frontend
  - **Uso**: Validação server-side de tokens, operações administrativas

- [ ] **URLs de Redirecionamento**
  - **Onde encontrar**: Dashboard > Settings > Auth > URL Configuration
  - **O que coletar**:
    - Site URL
    - Redirect URLs permitidas
  - **Por que é importante**: Para configurar redirecionamentos entre sistemas

- [ ] **Métodos de Autenticação Habilitados**
  - **Onde encontrar**: Dashboard > Settings > Auth > Providers
  - **O que verificar**:
    - Email/Password habilitado?
    - OAuth providers (Google, GitHub, etc.)?
  - **Por que é importante**: Para garantir compatibilidade entre sistemas

---

### **American Dream** ❌ (Não Iniciado)

#### **Informações Necessárias:**
- [ ] **Project ID** (ref)
- [ ] **Project URL** (https://xxxxx.supabase.co)
- [ ] **Organization ID**
- [ ] **Anon Key**
- [ ] **Publishable Key**
- [ ] **JWT Key ID (Atual)**
- [ ] **JWT Secret Key (ECC)**
- [ ] **Legacy JWT Secret (HS256)** ⚠️ **CRÍTICO**
- [ ] **Service Role Key**
- [ ] **Estrutura de dados** (tabela de usuários/perfis)
- [ ] **Estatísticas de usuários**
- [ ] **URLs de redirecionamento**
- [ ] **Métodos de auth habilitados**

---

## 🔍 Sobre JWT Secrets

### **Diferença entre Chaves Modernas e Legacy:**

#### **Chave Moderna (ECC P-256):**
- **Tipo**: ECC (Elliptic Curve Cryptography)
- **Formato**: Key ID + Secret Key
- **Exemplo**: 
  - Key ID: `d2956ee8-1f0e-43bc-bc0f-85435475334f`
  - Secret: `[REDACTED]`
- **Uso**: Tokens modernos do Supabase
- **⚠️ Para SSO**: Pode não ser compatível entre projetos diferentes

#### **Legacy JWT Secret (HS256):**
- **Tipo**: HS256 (HMAC SHA-256)
- **Formato**: String única (segredo compartilhado)
- **Uso**: Tokens legados, compatível entre projetos
- **⚠️ Para SSO**: **Este é geralmente o que precisamos!**
- **Onde encontrar**: Dashboard > JWT Keys > Tab "Segredo do legado JWT"

### **Por que Legacy JWT Secret para SSO?**

Quando dois projetos Supabase precisam compartilhar autenticação:
1. **Legacy JWT Secret (HS256)** é um segredo compartilhado simples
2. Ambos os projetos podem usar o **mesmo secret** para assinar/validar tokens
3. **Chaves ECC modernas** são específicas de cada projeto e não podem ser compartilhadas facilmente

---

## 📝 Próximas Ações

### **1. Completar Informações do 323 Network:**
- [ ] Acessar Dashboard > Settings > API > JWT Keys
- [ ] Clicar na aba **"Segredo do legado JWT"**
- [ ] Copiar o **Legacy JWT Secret** atual
- [ ] Copiar a **Service Role Key** (Settings > API)
- [ ] Verificar **URLs de redirecionamento** (Settings > Auth)
- [ ] Verificar **métodos de auth** habilitados (Settings > Auth > Providers)

### **2. Coletar Informações do American Dream:**
- [ ] Acessar o Dashboard do projeto American Dream
- [ ] Coletar todas as informações listadas acima
- [ ] **Especialmente importante**: Legacy JWT Secret

### **3. Comparar e Decidir Estratégia:**
- [ ] Comparar Legacy JWT Secrets dos dois projetos
- [ ] Decidir qual secret usar (ou gerar um novo compartilhado)
- [ ] Planejar migração (se necessário)

---

## ⚠️ Pontos de Atenção

### **Segurança:**
- ⚠️ **NUNCA** compartilhe Service Role Keys publicamente
- ⚠️ **NUNCA** commite JWT Secrets no código
- ⚠️ Use variáveis de ambiente ou secrets management

### **Migração:**
- ⚠️ Mudar JWT Secret pode invalidar tokens existentes
- ⚠️ Planejar janela de migração para não afetar usuários
- ⚠️ Considerar período de transição com ambas as chaves válidas

### **Compatibilidade:**
- ⚠️ Verificar se ambos os projetos usam a mesma versão do Supabase Auth
- ⚠️ Testar validação de token antes de implementar em produção

---

## 🎯 Objetivo Final

Ter todas as informações necessárias para:
1. ✅ Configurar JWT Secret compartilhado entre os dois projetos
2. ✅ Implementar middleware de validação de token
3. ✅ Criar interface de login unificada
4. ✅ Testar autenticação cruzada

---

**Status Atual**: 
- ✅ 323 Network: ~95% completo (faltam apenas URLs de redirecionamento e métodos de auth)
- ❌ American Dream: 0% (não iniciado)

**Próxima Ação Crítica**: Coletar todas as informações do projeto American Dream (especialmente Legacy JWT Secret)

