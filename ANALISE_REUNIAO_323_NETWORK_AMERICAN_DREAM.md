# 📋 Análise Completa - Reunião 323 Network & American Dream

## 🎯 Contexto e Decisões Estratégicas

### **Arquitetura de Sistemas**
- ✅ **Sistemas Distintos**: 323 Network e American Dream serão **sistemas separados**
- ✅ **Bancos de Dados Separados**: Cada sistema terá seu próprio banco de dados no Supabase
- ✅ **American Dream é Subdomínio**: American Dream é um subdomínio da 323 Network
- 🎯 **Objetivo de Autenticação**: Implementar **Single Sign-On (SSO)** entre os dois sistemas
  - Usuário cadastrado no 323 Network pode usar a mesma autenticação no American Dream
  - Autenticação compartilhada, mas dados em bancos separados

---

## 🏗️ Estrutura do Portal 323 Network

### **Arquitetura de Navegação (4 Pilares Principais)**

O menu superior/lateral será organizado em quatro seções principais:

#### 1. **Programas** (Substituindo "Cursos")
- Espaço para:
  - *US Venture Prep*
  - Cursos de inglês
  - Marketing
  - Social mídia
  - Outros programas educacionais

#### 2. **Serviços**
- Onde o usuário contrata e acompanha serviços:
  - Abertura de conta bancária
  - Abertura de empresa
  - Processo de mentoria do *American Dreaming*
  - Outros serviços da rede

#### 3. **Eventos**
- Mural com agenda de eventos:
  - Eventos passados
  - Eventos futuros
  - Todos vinculados à rede

#### 4. **Benefícios**
- Vitrine de empresas parceiras:
  - Academias
  - Fotógrafos
  - Contadores
  - Outros parceiros
- Descontos exclusivos para membros da 323

---

## 🎓 Ferramentas de Gestão Acadêmica (LMS Integrado)

### **Interface Estilo Google Classroom**

Para que a 323 Network funcione como plataforma de ensino para o *US Venture Prep*:

#### **Funcionalidades Principais:**
1. **Página Simples para Professores:**
   - Postar matéria
   - Postar vídeos
   - Postar avisos

2. **Upload Facilitado para Professores:**
   - Postar atualizações via celular
   - Postar via e-mail
   - Postar via mensagens de texto
   - Garantir agilidade na publicação

3. **Sistema de Cupons:**
   - Campo para aplicação de cupons de patrocínio
   - Exemplo: aluno paga $3000 ou usa cupom para 100% de desconto
   - Integração com sistema de pagamentos

---

## 🔧 Migração e Ajustes Técnicos (Back-end)

### **Tarefas de Integração Necessárias:**

#### 1. **Incorporar o American Dreaming**
- Trazer a lógica de "etapas de planejamento" do subdomínio separado
- Integrar dentro da base de dados da 323 Network
- Manter funcionalidade de mentoria e acompanhamento

#### 2. **Multilíngue Real**
- Configurar sistema para mudança nativa de idioma
- Ao mudar para inglês:
  - "Programas" → "Shows" ou "Programs"
  - Todos os termos traduzidos de forma nativa
- Implementar i18n completo e consistente

#### 3. **Remover Branding Pessoal**
- Substituir fotos dos sócios
- Usar elementos da marca 323 Network
- Tornar ambiente mais institucional e profissional
- Manter identidade visual consistente

---

## 📝 Tasks de Integração Identificadas

### **Task 1: Criar Aba "Benefícios"**
- [ ] Criar seção "Benefícios" no menu principal
- [ ] Sistema de cards de parceiros
- [ ] Exibir empresas parceiras (academias, fotógrafos, contadores)
- [ ] Mostrar descontos exclusivos para membros
- [ ] Integração com sistema de parceiros existente

### **Task 2: Migrar Módulo "Etapas de Planejamento"**
- [ ] Analisar estrutura atual do American Dream
- [ ] Migrar lógica de etapas de planejamento
- [ ] Integrar no dashboard da 323 Network
- [ ] Manter funcionalidade de mentoria
- [ ] Garantir compatibilidade com dados existentes

### **Task 3: Implementar Single Sign-On (SSO)**
- [ ] Configurar autenticação compartilhada entre sistemas
- [ ] Implementar botão de integração "Single Sign-On"
- [ ] Criar link direto para o Matrícula US
- [ ] Garantir que login no 323 Network funcione no American Dream
- [ ] Manter bancos de dados separados mas autenticação unificada

### **Task 4: Desenvolver Área de "Programas"**
- [ ] Criar seção "Programas" no menu (substituindo "Cursos")
- [ ] Implementar player de vídeo
- [ ] Área de anexos (estilo simplificado Google Classroom)
- [ ] Interface para professores postarem conteúdo
- [ ] Sistema de upload facilitado (celular, e-mail, SMS)

### **Task 5: Sistema de Cupons**
- [ ] Criar sistema de cupons de patrocínio
- [ ] Campo para aplicação de cupons
- [ ] Integração com sistema de pagamentos
- [ ] Suporte a descontos parciais e totais
- [ ] Validação e controle de uso de cupons

### **Task 6: LMS Integrado (Google Classroom Style)**
- [ ] Interface simples para professores
- [ ] Postagem de matéria
- [ ] Postagem de vídeos
- [ ] Postagem de avisos
- [ ] Upload via múltiplos canais (celular, e-mail, SMS)

### **Task 7: Multilíngue Real**
- [ ] Configurar tradução nativa de termos
- [ ] "Programas" → "Shows" ou "Programs" em inglês
- [ ] Revisar todas as traduções
- [ ] Garantir consistência em todo o sistema

### **Task 8: Remover Branding Pessoal**
- [ ] Identificar todas as fotos dos sócios
- [ ] Substituir por elementos da marca 323 Network
- [ ] Atualizar identidade visual
- [ ] Tornar ambiente mais institucional

---

## 🔐 Arquitetura de Autenticação (SSO)

### **Desafio Técnico:**
- Dois sistemas separados (323 Network e American Dream)
- Dois bancos de dados separados no Supabase
- **Objetivo**: Autenticação compartilhada (Single Sign-On)

### **Solução Proposta:**
1. **Supabase Auth como Base:**
   - Usar Supabase Auth como provedor central
   - Ambos os sistemas usam o mesmo projeto de autenticação
   - Ou criar projeto de autenticação compartilhado

2. **JWT Tokens Compartilhados:**
   - Token gerado no 323 Network pode ser validado no American Dream
   - Configurar mesma chave secreta JWT entre projetos
   - Ou usar Supabase Auth com múltiplos projetos

3. **Implementação:**
   - Configurar Supabase Auth para múltiplos projetos
   - Criar middleware de autenticação compartilhada
   - Implementar validação de token entre sistemas

### **Considerações:**
- ⚠️ **Segurança**: Garantir que tokens sejam válidos apenas para sistemas autorizados
- ⚠️ **Escopo de Dados**: Manter dados separados, apenas autenticação compartilhada
- ⚠️ **Performance**: Minimizar latência na validação entre sistemas

---

## 📊 Estrutura de Dados Proposta

### **323 Network Database:**
- Usuários (profiles)
- Eventos (events)
- Posts e conteúdo
- Conexões (connections)
- Serviços (services)
- Benefícios (benefits)
- Programas (programs) - **NOVO**
- Etapas de planejamento (migrado do American Dream)

### **American Dream Database:**
- Dados específicos do American Dream
- Processo de mentoria
- Dados de mentees
- Conteúdo específico do programa

### **Autenticação Compartilhada:**
- Supabase Auth (projeto central)
- Tokens JWT compartilhados
- Sessões sincronizadas

---

## 🎨 Mudanças de UI/UX

### **Menu Principal:**
- **Antes**: Cursos, Serviços, Eventos, Benefícios (não existia)
- **Depois**: Programas, Serviços, Eventos, Benefícios

### **Identidade Visual:**
- Remover fotos pessoais dos sócios
- Usar elementos da marca 323 Network
- Ambiente mais institucional e profissional

### **Multilíngue:**
- Tradução nativa e completa
- "Programas" → "Shows" ou "Programs"
- Consistência em todo o sistema

---

## ⏳ Próximos Passos

1. **Aguardar Transcrição Completa da Reunião**
   - Analisar todos os detalhes
   - Identificar tasks adicionais
   - Priorizar implementações

2. **Análise Técnica Detalhada:**
   - Arquitetura de SSO
   - Estrutura de dados
   - Integrações necessárias

3. **Planejamento de Sprints:**
   - Organizar tasks por prioridade
   - Estimar esforço
   - Definir dependências

4. **Prototipagem:**
   - Interface de Programas
   - Sistema de Benefícios
   - LMS integrado

---

## 📌 Notas Importantes

- ✅ Sistemas permanecem separados (bancos de dados distintos)
- ✅ Autenticação será compartilhada via SSO
- ✅ American Dream é subdomínio da 323 Network
- ✅ Foco em experiência unificada para o usuário
- ✅ Manter escalabilidade e manutenibilidade

---

**Status**: ⏳ Aguardando transcrição completa da reunião para análise detalhada

**Próxima Ação**: Receber e analisar transcrição completa para identificar todas as tasks e requisitos

