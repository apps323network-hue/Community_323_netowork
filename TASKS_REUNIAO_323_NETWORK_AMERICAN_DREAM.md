# 📋 Tasks - Reunião 323 Network & American Dream

## 🔐 **AUTENTICAÇÃO COMPARTILHADA (SSO) - PRIORIDADE ALTA**

Estas tasks são fundamentais para permitir que os dois sistemas funcionem de forma integrada.

### **Task SSO-1: Configurar Supabase Auth Compartilhado**
- [ ] Analisar estrutura atual de autenticação do 323 Network
- [ ] Analisar estrutura atual de autenticação do American Dream
- [ ] Decidir estratégia: mesmo projeto Supabase Auth ou projetos separados com JWT compartilhado
- [ ] Configurar Supabase Auth para suportar múltiplos projetos/sistemas
- [ ] Implementar middleware de autenticação compartilhada
- [ ] Testar autenticação cruzada entre sistemas

**Responsável**: Backend/DevOps  
**Prioridade**: 🔴 CRÍTICA  
**Dependências**: Nenhuma (bloqueia outras tasks)

---

### **Task SSO-2: Implementar Validação de Token Entre Sistemas**
- [ ] Criar serviço de validação de JWT tokens
- [ ] Configurar mesma chave secreta JWT entre projetos (se necessário)
- [ ] Implementar endpoint de validação de token
- [ ] Criar middleware para verificar tokens de ambos os sistemas
- [ ] Adicionar logs de autenticação compartilhada
- [ ] Documentar fluxo de autenticação

**Responsável**: Backend  
**Prioridade**: 🔴 CRÍTICA  
**Dependências**: SSO-1

---

### **Task SSO-3: Criar Interface de Login Unificada**
- [ ] Criar componente de login que funcione para ambos os sistemas
- [ ] Implementar redirecionamento após login baseado em origem
- [ ] Adicionar indicador visual de "Login com 323 Network" no American Dream
- [ ] Adicionar indicador visual de "Login com American Dream" no 323 Network (se necessário)
- [ ] Testar fluxo de login em ambos os sistemas

**Responsável**: Frontend  
**Prioridade**: 🟡 ALTA  
**Dependências**: SSO-1, SSO-2

---

### **Task SSO-4: Sincronização de Sessões**
- [ ] Implementar sincronização de sessões entre sistemas
- [ ] Garantir que logout em um sistema afete o outro (opcional/configurável)
- [ ] Implementar refresh token compartilhado
- [ ] Adicionar timeout de sessão consistente
- [ ] Testar cenários de sessão expirada

**Responsável**: Backend  
**Prioridade**: 🟡 ALTA  
**Dependências**: SSO-1, SSO-2

---

## 🏢 **323 NETWORK - TASKS**

### **Task 323-1: Criar Seção "Benefícios" no Menu Principal**
- [ ] Adicionar item "Benefícios" no menu de navegação
- [ ] Criar rota `/beneficios` ou `/benefits`
- [ ] Criar componente `BenefitsPage.vue` ou similar
- [ ] Implementar layout de cards para parceiros
- [ ] Integrar com tabela `partners` existente
- [ ] Adicionar filtros por categoria (academias, fotógrafos, contadores, etc.)
- [ ] Exibir descontos exclusivos para membros
- [ ] Adicionar busca de parceiros
- [ ] Implementar design responsivo
- [ ] Adicionar traduções (pt-BR e en-US)

**Responsável**: Frontend  
**Prioridade**: 🟡 ALTA  
**Dependências**: Nenhuma

---

### **Task 323-2: Renomear "Cursos" para "Programas"**
- [ ] Atualizar menu de navegação: "Cursos" → "Programas"
- [ ] Atualizar rotas (se necessário)
- [ ] Atualizar traduções:
  - pt-BR: "Programas"
  - en-US: "Shows" ou "Programs"
- [ ] Atualizar componentes que referenciam "Cursos"
- [ ] Atualizar documentação
- [ ] Verificar e atualizar URLs/links internos

**Responsável**: Frontend  
**Prioridade**: 🟡 ALTA  
**Dependências**: Nenhuma

---

### **Task 323-3: Desenvolver Área de "Programas" com Player de Vídeo**
- [ ] Criar estrutura de dados para programas (tabela `programs`)
  - [ ] id, titulo, descricao, tipo (us_venture_prep, ingles, marketing, etc.)
  - [ ] video_url, anexos (array), professor_id, status
  - [ ] created_at, updated_at
- [ ] Criar interface de listagem de programas
- [ ] Implementar player de vídeo integrado
- [ ] Criar área de anexos (estilo simplificado Google Classroom)
- [ ] Adicionar funcionalidade de download de materiais
- [ ] Implementar design responsivo
- [ ] Adicionar filtros por tipo de programa
- [ ] Adicionar busca de programas

**Responsável**: Full-stack  
**Prioridade**: 🟡 ALTA  
**Dependências**: 323-2

---

### **Task 323-4: Implementar LMS Integrado (Google Classroom Style)**
- [ ] Criar interface para professores postarem conteúdo
- [ ] Implementar área de postagem de matéria
- [ ] Implementar área de postagem de vídeos
- [ ] Implementar área de postagem de avisos
- [ ] Criar sistema de upload de arquivos
- [ ] Adicionar preview de conteúdo antes de publicar
- [ ] Implementar notificações para alunos quando novo conteúdo é postado
- [ ] Adicionar timeline/feed de atividades do programa
- [ ] Implementar design estilo Google Classroom (simplificado)

**Responsável**: Full-stack  
**Prioridade**: 🟡 ALTA  
**Dependências**: 323-3

---

### **Task 323-5: Upload Facilitado para Professores (Múltiplos Canais)**
- [ ] Implementar upload via interface web
- [ ] Criar endpoint para upload via e-mail (webhook)
- [ ] Criar endpoint para upload via SMS (webhook)
- [ ] Criar endpoint para upload via API mobile
- [ ] Implementar processamento automático de anexos recebidos
- [ ] Adicionar validação de formato de arquivo
- [ ] Adicionar limite de tamanho de arquivo
- [ ] Criar notificações quando conteúdo é recebido via e-mail/SMS
- [ ] Documentar como professores podem usar cada canal

**Responsável**: Backend + Integrações  
**Prioridade**: 🟢 MÉDIA  
**Dependências**: 323-4

---

### **Task 323-6: Sistema de Cupons de Patrocínio**
- [ ] Criar tabela `coupons` no banco de dados
  - [ ] id, codigo, descricao, desconto_percentual, desconto_fixo
  - [ ] valor_minimo, data_inicio, data_fim, ativo
  - [ ] limite_uso, usado_por (array de user_ids)
  - [ ] programa_id (opcional - cupom específico para programa)
  - [ ] created_at, updated_at
- [ ] Criar interface admin para gerenciar cupons
- [ ] Adicionar campo de cupom no checkout/pagamento
- [ ] Implementar validação de cupom (código, validade, limite)
- [ ] Integrar com sistema de pagamentos (Stripe)
- [ ] Aplicar desconto no cálculo de pagamento
- [ ] Adicionar histórico de uso de cupons
- [ ] Criar relatórios de cupons utilizados
- [ ] Adicionar notificações quando cupom é aplicado

**Responsável**: Full-stack  
**Prioridade**: 🟡 ALTA  
**Dependências**: 323-3, Sistema de pagamentos existente

---

### **Task 323-7: Migrar Módulo "Etapas de Planejamento" do American Dream**
- [ ] Analisar estrutura atual do American Dream
  - [ ] Identificar tabelas relacionadas a etapas de planejamento
  - [ ] Identificar lógica de negócio
  - [ ] Identificar dependências
- [ ] Criar estrutura de dados na 323 Network
  - [ ] Tabela `planning_stages` ou similar
  - [ ] Tabela `user_planning_progress` ou similar
  - [ ] Migrar relacionamentos necessários
- [ ] Migrar dados existentes (se houver)
- [ ] Adaptar lógica de negócio para 323 Network
- [ ] Criar interface de visualização de etapas
- [ ] Criar interface de acompanhamento de progresso
- [ ] Integrar com dashboard do usuário
- [ ] Testar funcionalidade completa
- [ ] Documentar migração

**Responsável**: Full-stack  
**Prioridade**: 🟡 ALTA  
**Dependências**: SSO-1, SSO-2 (para acesso aos dados)

---

### **Task 323-8: Remover Branding Pessoal e Substituir por Marca 323 Network**
- [ ] Identificar todas as fotos dos sócios no sistema
- [ ] Identificar referências pessoais (nomes, biografias, etc.)
- [ ] Substituir por elementos da marca 323 Network
- [ ] Atualizar "Sobre Nós" / "About Us"
- [ ] Atualizar páginas de parceiros
- [ ] Atualizar materiais de marketing
- [ ] Tornar ambiente mais institucional e profissional
- [ ] Manter identidade visual consistente
- [ ] Revisar textos para tom mais corporativo

**Responsável**: Frontend + Design  
**Prioridade**: 🟢 MÉDIA  
**Dependências**: Nenhuma

---

### **Task 323-9: Melhorar Multilíngue Real**
- [ ] Revisar todas as traduções existentes
- [ ] Garantir que "Programas" → "Shows" ou "Programs" em inglês
- [ ] Adicionar traduções faltantes
- [ ] Verificar consistência de termos técnicos
- [ ] Testar mudança de idioma em todas as páginas
- [ ] Garantir que URLs e metadados também sejam traduzidos
- [ ] Adicionar traduções para novos componentes (Benefícios, Programas, etc.)

**Responsável**: Frontend  
**Prioridade**: 🟢 MÉDIA  
**Dependências**: 323-1, 323-2, 323-3

---

### **Task 323-10: Integração com Matrícula US (Link Direto)**
- [ ] Analisar sistema Matrícula US
- [ ] Criar botão/link de integração "Single Sign-On"
- [ ] Implementar redirecionamento com token de autenticação
- [ ] Garantir que usuário logado no 323 Network seja reconhecido no Matrícula US
- [ ] Testar fluxo completo de integração
- [ ] Adicionar documentação para usuários

**Responsável**: Backend + Integrações  
**Prioridade**: 🟢 MÉDIA  
**Dependências**: SSO-1, SSO-2, SSO-3

---

## 🇺🇸 **AMERICAN DREAM - TASKS**

### **Task AD-1: Configurar Autenticação Compartilhada (Lado American Dream)**
- [ ] Integrar com sistema de autenticação compartilhada
- [ ] Configurar validação de tokens do 323 Network
- [ ] Implementar middleware de autenticação
- [ ] Criar interface de login que aceita credenciais do 323 Network
- [ ] Adicionar indicador visual "Login com 323 Network"
- [ ] Testar autenticação cruzada
- [ ] Garantir que dados do American Dream permaneçam no banco próprio

**Responsável**: Backend + Frontend  
**Prioridade**: 🔴 CRÍTICA  
**Dependências**: SSO-1, SSO-2

---

### **Task AD-2: Manter Dados Separados do 323 Network**
- [ ] Garantir que banco de dados do American Dream seja independente
- [ ] Verificar que dados de mentoria não sejam compartilhados
- [ ] Verificar que dados de mentees não sejam compartilhados
- [ ] Manter apenas autenticação compartilhada
- [ ] Adicionar validações para garantir isolamento de dados
- [ ] Documentar estrutura de dados do American Dream

**Responsável**: Backend  
**Prioridade**: 🔴 CRÍTICA  
**Dependências**: SSO-1, SSO-2

---

### **Task AD-3: Atualizar Interface para Refletir Integração**
- [ ] Adicionar logo/link para 323 Network
- [ ] Atualizar textos para mencionar integração (se necessário)
- [ ] Garantir que identidade visual seja consistente mas distinta
- [ ] Adicionar navegação entre sistemas (se necessário)
- [ ] Testar experiência do usuário entre sistemas

**Responsável**: Frontend  
**Prioridade**: 🟢 MÉDIA  
**Dependências**: AD-1

---

## 📊 **RESUMO DE PRIORIDADES**

### 🔴 **CRÍTICAS (Fazer Primeiro)**
1. SSO-1: Configurar Supabase Auth Compartilhado
2. SSO-2: Implementar Validação de Token Entre Sistemas
3. AD-1: Configurar Autenticação Compartilhada (Lado American Dream)
4. AD-2: Manter Dados Separados do 323 Network

### 🟡 **ALTAS (Fazer em Seguida)**
1. SSO-3: Criar Interface de Login Unificada
2. SSO-4: Sincronização de Sessões
3. 323-1: Criar Seção "Benefícios"
4. 323-2: Renomear "Cursos" para "Programas"
5. 323-3: Desenvolver Área de "Programas"
6. 323-4: Implementar LMS Integrado
7. 323-6: Sistema de Cupons
8. 323-7: Migrar Módulo "Etapas de Planejamento"

### 🟢 **MÉDIAS (Fazer Depois)**
1. 323-5: Upload Facilitado para Professores
2. 323-8: Remover Branding Pessoal
3. 323-9: Melhorar Multilíngue Real
4. 323-10: Integração com Matrícula US
5. AD-3: Atualizar Interface para Refletir Integração

---

## 🔗 **DEPENDÊNCIAS ENTRE TASKS**

```
SSO-1 (Auth Compartilhado)
  ├── SSO-2 (Validação de Token)
  │   ├── SSO-3 (Interface Login)
  │   ├── SSO-4 (Sincronização Sessões)
  │   ├── AD-1 (Auth American Dream)
  │   ├── AD-2 (Dados Separados)
  │   ├── 323-7 (Migrar Etapas)
  │   └── 323-10 (Matrícula US)
  │
  └── 323-2 (Renomear Cursos)
      └── 323-3 (Área Programas)
          ├── 323-4 (LMS Integrado)
          │   └── 323-5 (Upload Múltiplos Canais)
          │
          └── 323-6 (Sistema Cupons)

323-1 (Benefícios) [Independente]
323-8 (Remover Branding) [Independente]
323-9 (Multilíngue) [Depende de 323-1, 323-2, 323-3]
AD-3 (Interface AD) [Depende de AD-1]
```

---

## 📝 **NOTAS IMPORTANTES**

1. **Autenticação é a Base**: Todas as tasks de integração dependem do SSO funcionando
2. **Dados Separados**: Garantir que apenas autenticação seja compartilhada, dados permanecem separados
3. **Priorizar SSO**: Tasks de autenticação devem ser feitas primeiro
4. **Testes Cruzados**: Sempre testar funcionalidades que envolvem ambos os sistemas
5. **Documentação**: Documentar todas as integrações e decisões técnicas

---

**Status**: ✅ Tasks organizadas e priorizadas  
**Próxima Ação**: Iniciar implementação das tasks críticas de SSO

