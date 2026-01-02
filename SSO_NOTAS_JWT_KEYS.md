# 🔐 Notas sobre JWT Keys para SSO

## 📋 Situação Atual - 323 Network

### **Chaves Identificadas:**

#### **1. Chave Moderna (ECC P-256) - ATUAL**
- **Key ID**: `d2956ee8-1f0e-43bc-bc0f-85435475334f`
- **Tipo**: ECC (P-256)
- **Status**: CHAVE ATUAL (CURRENT KEY)
- **Secret**: `[REDACTED - Obter no Dashboard > Settings > API > JWT Keys]`
- **Uso**: Tokens modernos do Supabase
- **⚠️ Para SSO**: Pode não ser compatível entre projetos diferentes

#### **2. Chave Standby (HS256) - EM ESPERA**
- **Key ID**: `5cfbc657-5f26-4781-a34e-09fb712880b8`
- **Tipo**: HS256 (Shared Secret)
- **Status**: Standby (chave de espera - ainda não ativa)
- **⚠️ Para SSO**: Esta é uma chave de espera, não a chave atual em uso

#### **3. Chave Anterior (HS256) - ROTACIONADA**
- **Key ID**: `17BF52CA-8EB3-4A74-B4F2-EF9DB7ADAE14`
- **Tipo**: Legacy HS256 (Shared Secret)
- **Status**: CHAVE ANTERIOR (PREVIOUS KEY)
- **Última rotação**: 11 dias atrás
- **⚠️ Para SSO**: Esta chave foi rotacionada e não está mais em uso

---

## 🤔 Análise da Situação

### **Cenário Possível:**

O projeto 323 Network pode estar em uma das seguintes situações:

1. **Cenário A: Usando apenas chaves ECC modernas**
   - Não há chave HS256 atual ativa
   - Apenas a chave ECC está em uso
   - A chave standby HS256 está aguardando ativação

2. **Cenário B: Transição entre chaves**
   - Projeto está migrando de HS256 para ECC
   - Chave HS256 anterior foi rotacionada há 11 dias
   - Nova chave HS256 está em standby, aguardando ativação

3. **Cenário C: Chave HS256 atual não visível**
   - Pode haver uma chave HS256 atual que não está aparecendo na interface
   - Pode estar em outra seção ou aba

---

## 🎯 O Que Precisamos para SSO

### **Opção 1: Usar Legacy JWT Secret (HS256) - RECOMENDADO**

**Vantagens:**
- ✅ Compatível entre projetos Supabase diferentes
- ✅ Fácil de compartilhar (um único secret)
- ✅ Padrão para SSO entre sistemas Supabase

**Requisitos:**
- [ ] Encontrar a chave HS256 **ATUAL** (não standby)
- [ ] Obter o **secret value** (não apenas o Key ID)
- [ ] Verificar se o American Dream também usa HS256

**Como obter:**
1. Dashboard > Settings > API > JWT Keys
2. Aba "Segredo do legado JWT"
3. Procurar chave marcada como **"CHAVE ATUAL"** ou **"CURRENT KEY"**
4. Copiar o **secret value** (geralmente uma string longa)

---

### **Opção 2: Ativar Chave Standby HS256**

Se não houver chave HS256 atual, podemos:

1. **Ativar a chave standby** `5cfbc657-5f26-4781-a34e-09fb712880b8`
2. **Obter o secret value** dessa chave
3. **Compartilhar com American Dream**

**⚠️ Considerações:**
- Ativar uma nova chave pode invalidar tokens existentes
- Planejar janela de migração
- Testar antes de ativar em produção

---

### **Opção 3: Usar Chaves ECC Modernas (Mais Complexo)**

Se ambos os projetos usarem apenas chaves ECC:

**Desafios:**
- Chaves ECC são específicas de cada projeto
- Não podem ser compartilhadas diretamente
- Requer implementação mais complexa de validação cruzada

**Solução possível:**
- Criar serviço de validação centralizado
- Ambos os sistemas consultam o serviço para validar tokens
- Mais complexo, mas possível

---

## 📝 Próximas Ações

### **1. Verificar Chave HS256 Atual:**
- [ ] Acessar Dashboard > Settings > API > JWT Keys
- [ ] Aba "Segredo do legado JWT"
- [ ] Procurar chave marcada como **"CHAVE ATUAL"**
- [ ] Se não existir, verificar se há outra seção ou configuração

### **2. Se Não Houver Chave HS256 Atual:**
- [ ] Decidir se vamos ativar a chave standby
- [ ] Obter o secret value da chave standby
- [ ] Planejar migração (se necessário)

### **3. Verificar American Dream:**
- [ ] Coletar informações de JWT Keys do American Dream
- [ ] Verificar se usa HS256 ou ECC
- [ ] Comparar com 323 Network

### **4. Decidir Estratégia:**
- [ ] Se ambos usam HS256: Compartilhar secret
- [ ] Se um usa HS256 e outro ECC: Planejar migração
- [ ] Se ambos usam ECC: Implementar validação centralizada

---

## ⚠️ Pontos de Atenção

### **Segurança:**
- ⚠️ **NUNCA** compartilhe secrets publicamente
- ⚠️ Use variáveis de ambiente ou secrets management
- ⚠️ Rotacione secrets periodicamente

### **Migração:**
- ⚠️ Mudar JWT Secret pode invalidar tokens existentes
- ⚠️ Planejar janela de migração
- ⚠️ Considerar período de transição com ambas as chaves válidas

### **Compatibilidade:**
- ⚠️ Verificar versão do Supabase Auth em ambos os projetos
- ⚠️ Testar validação de token antes de produção
- ⚠️ Garantir que ambos os sistemas suportam o mesmo tipo de chave

---

## 🔍 Checklist de Verificação

### **323 Network:**
- [x] Chave ECC moderna identificada
- [x] Chave HS256 standby identificada
- [x] Chave HS256 anterior identificada (rotacionada)
- [ ] **Chave HS256 ATUAL identificada** ⚠️ **FALTA**
- [ ] **Secret value da chave HS256 atual obtido** ⚠️ **FALTA**

### **American Dream:**
- [ ] Todas as informações de JWT Keys coletadas
- [ ] Tipo de chave identificado (HS256 ou ECC)
- [ ] Secret value obtido (se HS256)

---

**Status**: ⏳ Aguardando identificação da chave HS256 ATUAL do 323 Network

**Próxima Ação Crítica**: Verificar se há chave HS256 atual ativa ou se precisamos ativar a chave standby

