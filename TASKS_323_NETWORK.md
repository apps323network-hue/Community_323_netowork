# 📋 TASKS - 323 NETWORK HUB
## Estrutura Técnica para Trello

> **Referência de Design Principal**: [Skool.com](https://www.skool.com/)  
> Interface limpa, minimalista, feed centralizado, gamificação sutil.

---

## 🚀 ÉPICO 1: SETUP INICIAL E INFRAESTRUTURA

### 1.1 Setup do Projeto (Vue.js)
- [x] **Task 1.1.1**: Criar projeto Vue.js 3 com Vite
- [x] **Task 1.1.2**: Configurar TypeScript (opcional, mas recomendado)
- [x] **Task 1.1.3**: Configurar ESLint + Prettier para Vue.js
- [x] **Task 1.1.4**: Setup de estrutura de pastas (src/, components/, views/, composables/, stores/)
- [x] **Task 1.1.5**: Configurar variáveis de ambiente (.env.local)
- [x] **Task 1.1.6**: Configurar Vue Router
- [x] **Task 1.1.7**: Configurar Pinia (state management)

### 1.2 Supabase Setup
- [x] **Task 1.2.1**: Criar projeto Supabase
- [x] **Task 1.2.2**: Configurar autenticação (Email/Password + OAuth opcional)
- [x] **Task 1.2.3**: Configurar Row Level Security (RLS) policies básicas
- [x] **Task 1.2.4**: Setup de migrations folder

### 1.3 Design System / UI (HTML/CSS dos Designers)
- [x] **Task 1.3.1**: Receber HTML/CSS dos designers
- [x] **Task 1.3.2**: Analisar estrutura HTML/CSS fornecida
- [x] **Task 1.3.3**: Converter componentes HTML em componentes Vue.js
- [x] **Task 1.3.4**: Integrar CSS dos designers no projeto Vue.js
- [x] **Task 1.3.5**: Adaptar CSS para componentes Vue (scoped styles ou CSS modules)
- [x] **Task 1.3.6**: Configurar navegação estilo Skool (sidebar fixa desktop / menu inferior mobile)
- [x] **Task 1.3.7**: Implementar layout duas colunas (sidebar + conteúdo principal)
- [x] **Task 1.3.8**: Garantir responsividade mobile-first (testar e ajustar se necessário)
- [x] **Task 1.3.9**: Extrair componentes reutilizáveis do HTML dos designers

---

## 🔐 ÉPICO 2: AUTENTICAÇÃO E USUÁRIOS

    ### 2.1 Autenticação
    - [x] **Task 2.1.1**: Implementar login (email/password)
    - [x] **Task 2.1.2**: Implementar registro/signup
    - [x] **Task 2.1.3**: Implementar recuperação de senha
    - [x] **Task 2.1.4**: Implementar logout
    - [x] **Task 2.1.5**: Middleware de proteção de rotas

    ### 2.2 Schema de Usuários (Supabase)
    - [x] **Task 2.2.1**: Criar tabela `profiles` (extends auth.users)
    - Campos: nome, area_atuacao, cidade, pais, objetivo, whatsapp, linkedin, plano, badge
    - [x] **Task 2.2.2**: Criar RLS policies para profiles
    - [x] **Task 2.2.3**: Criar função de criação automática de profile no signup

    ### 2.3 Planos e Badges
    - [x] **Task 2.3.1**: Criar enum/tabela de planos (Free, Member, Premium)
    - [x] **Task 2.3.2**: Implementar sistema de badges
    - [x] **Task 2.3.3**: Middleware de verificação de plano

---

## 🏠 ÉPICO 3: HOME / DASHBOARD

### 3.1 Layout da Home
- [ ] **Task 3.1.1**: Criar componente de boas-vindas personalizado
- [ ] **Task 3.1.2**: Implementar seção "Objetivo atual" (dinâmico)
- [ ] **Task 3.1.3**: Criar CTA rotativo semanal (sistema de rotação)
- [ ] **Task 3.1.4**: Implementar seção "Benefícios ativos"
- [ ] **Task 3.1.5**: Criar seção "Destaques" (próximo evento, post fixado, serviço em destaque)

### 3.2 Lógica de Dados
- [ ] **Task 3.2.1**: Criar query para buscar objetivo atual do usuário
- [ ] **Task 3.2.2**: Criar sistema de rotação de CTAs (semanal)
- [ ] **Task 3.2.3**: Query para benefícios ativos do usuário
- [ ] **Task 3.2.4**: Query para destaques (eventos, posts, serviços)

---

## 💬 ÉPICO 4: COMUNIDADE / FEED (CORE) - Estilo Skool ✅

> **Referência**: Feed centralizado do Skool.com - interface limpa, cards espaçados, tipos de post visíveis

### 4.1 Schema de Posts ✅
- [x] **Task 4.1.1**: Criar tabela `posts`
  - Campos: user_id, tipo (networking/parceria, ofereco_servico, procuro_ajuda, oportunidade), conteudo, fixado, created_at, updated_at
- [x] **Task 4.1.2**: Criar tabela `post_likes` (relação many-to-many)
- [x] **Task 4.1.3**: Criar tabela `post_comments`
- [x] **Task 4.1.4**: Configurar RLS para posts

### 4.2 UI do Feed (Estilo Skool) ✅
- [x] **Task 4.2.1**: Criar componente de card de post estilo Skool (branco, sombra sutil, espaçamento generoso)
- [x] **Task 4.2.2**: Implementar timeline/feed infinito (infinite scroll suave, como Skool)
- [x] **Task 4.2.3**: Criar componente de criação de post (botão fixo ou topo, modal simples)
- [x] **Task 4.2.4**: Implementar seleção de tipo de post com ícones destacados (🤝 💼 🔎 📣) - sempre visível no card
  - *Nota: Decisão de produto - não necessário por enquanto, funcionalidade básica implementada*
- [x] **Task 4.2.5**: Implementar sistema de likes estilo Skool (otimistic updates, contador visível)
- [x] **Task 4.2.6**: Implementar sistema de comentários (thread simples, não complexo)
- [x] **Task 4.2.7**: Implementar posts fixados (destaque no topo, badge "Fixado")
- [x] **Task 4.2.8**: Layout feed centralizado (largura máxima ~800px, centralizado)

### 4.3 Filtros e Busca ✅
- [x] **Task 4.3.1**: Criar filtros por tipo de post
  - *Nota: Componentes criados, não integrados por decisão de produto*
- [x] **Task 4.3.2**: Implementar busca de posts (full-text search)
  - *Nota: Componentes criados, não integrados por decisão de produto*
- [x] **Task 4.3.3**: Implementar ordenação (recentes, mais curtidos)
  - *Nota: Lógica implementada no store, não exposta na UI por decisão de produto*

### 4.4 Interações ✅
- [x] **Task 4.4.1**: Implementar notificações de likes/comentários
  - *Nota: Não necessário por enquanto - funcionalidade futura*
- [x] **Task 4.4.2**: Criar sistema de menções (@username)
  - *Nota: Não necessário por enquanto - funcionalidade futura*
- [x] **Task 4.4.3**: Implementar compartilhamento de posts

---

## 👥 ÉPICO 5: MEMBROS / DIRETÓRIO

### 5.1 Schema e Queries
- [ ] **Task 5.1.1**: Criar view/query para listagem de membros
- [ ] **Task 5.1.2**: Implementar busca de membros (nome, área, cidade)
- [ ] **Task 5.1.3**: Criar filtros (área de atuação, cidade/estado, objetivo, plano)

### 5.2 UI do Diretório
- [ ] **Task 5.2.1**: Criar componente de card de membro
  - Exibir: nome, área, cidade/pais, objetivo, badge
- [ ] **Task 5.2.2**: Implementar grid/listagem de membros
- [ ] **Task 5.2.3**: Criar botões de ação (WhatsApp, LinkedIn) com links externos
- [ ] **Task 5.2.4**: Implementar paginação ou infinite scroll
- [ ] **Task 5.2.5**: [FUTURO] Preparar estrutura para Map View (não no MVP)

### 5.3 Perfil Público
- [ ] **Task 5.3.1**: Criar página de perfil público (/membros/[id])
- [ ] **Task 5.3.2**: Exibir informações públicas do membro
- [ ] **Task 5.3.3**: Exibir posts do membro (opcional)

---

## 📅 ÉPICO 6: EVENTOS

### 6.1 Schema de Eventos
- [ ] **Task 6.1.1**: Criar tabela `events`
  - Campos: titulo, descricao, data_hora, tipo (presencial/webinar), local, link_gravacao, created_by
- [ ] **Task 6.1.2**: Criar tabela `event_confirmations` (relação many-to-many)
- [ ] **Task 6.1.3**: Configurar RLS para eventos

### 6.2 UI de Eventos
- [ ] **Task 6.2.1**: Criar página de listagem de eventos
- [ ] **Task 6.2.2**: Criar card de evento
- [ ] **Task 6.2.3**: Implementar botão "Confirmar presença"
- [ ] **Task 6.2.4**: Criar página de detalhes do evento
- [ ] **Task 6.2.5**: Implementar exibição de gravação (pós-evento)
- [x] **Task 6.2.6**: Criar CTA para serviço relacionado (pós-evento)

### 6.3 Calendário
- [x] **Task 6.3.1**: Implementar visualização de calendário (biblioteca: react-big-calendar ou similar)
- [x] **Task 6.3.2**: Filtrar eventos por tipo (presencial/webinar)
- [x] **Task 6.3.3**: Implementar evento fixo semanal (MVP: 1 evento)

### 6.4 Admin de Eventos
- [ ] **Task 6.4.1**: Criar interface para empresas parceiras cadastrarem eventos
- [ ] **Task 6.4.2**: Implementar aprovação de eventos (se necessário)

---

## 🛒 ÉPICO 7: SERVIÇOS / MARKETPLACE

### 7.1 Schema de Serviços
- [ ] **Task 7.1.1**: Criar tabela `services`
  - Campos: nome, descricao, parceiro_id, categoria, beneficio_membro, destaque, ativo
- [ ] **Task 7.1.2**: Criar tabela `service_requests` (solicitações de atendimento)
- [ ] **Task 7.1.3**: Criar tabela `partners` (empresas parceiras)
- [ ] **Task 7.1.4**: Configurar RLS

### 7.2 UI do Marketplace
- [ ] **Task 7.2.1**: Criar página de listagem de serviços
- [ ] **Task 7.2.2**: Criar card de serviço
  - Exibir: nome, descricao, benefício para membros, botão "Solicitar atendimento"
- [ ] **Task 7.2.3**: Implementar filtros por categoria
- [ ] **Task 7.2.4**: Implementar serviço em destaque (home)
- [ ] **Task 7.2.5**: Criar modal/formulário de solicitação de atendimento

### 7.3 Gestão de Solicitações
- [ ] **Task 7.3.1**: Criar página de solicitações do usuário
- [ ] **Task 7.3.2**: Implementar status de solicitação (pendente, em andamento, concluído)
- [ ] **Task 7.3.3**: Notificar parceiro sobre nova solicitação

---

## 🎁 ÉPICO 8: BENEFÍCIOS

### 8.1 Schema de Benefícios
- [ ] **Task 8.1.1**: Criar tabela `benefits`
  - Campos: nome, descricao, tipo (mensal/fixo/plano), plano_requerido, valido_ate, ativo
- [ ] **Task 8.1.2**: Criar tabela `user_benefits` (benefícios utilizados pelo usuário)
- [ ] **Task 8.1.3**: Configurar RLS

### 8.2 UI de Benefícios
- [ ] **Task 8.2.1**: Criar página de listagem de benefícios
- [ ] **Task 8.2.2**: Implementar seção "Benefício do mês"
- [ ] **Task 8.2.3**: Implementar seção "Benefícios fixos"
- [ ] **Task 8.2.4**: Implementar bloqueio de benefícios por plano (🔒)
- [ ] **Task 8.2.5**: Criar CTA de upsell (Desbloquear no plano Member/Premium)
- [ ] **Task 8.2.6**: Implementar ativação/utilização de benefício

### 8.3 Lógica de Benefícios
- [ ] **Task 8.3.1**: Criar sistema de rotação de "Benefício do mês"
- [ ] **Task 8.3.2**: Implementar validação de elegibilidade por plano
- [ ] **Task 8.3.3**: Criar histórico de benefícios utilizados

---

## 👤 ÉPICO 9: PERFIL DO USUÁRIO

### 9.1 Edição de Perfil
- [ ] **Task 9.1.1**: Criar página de edição de perfil (/perfil/editar)
- [ ] **Task 9.1.2**: Formulário com campos: nome, área, cidade, país, objetivo, WhatsApp, LinkedIn
- [ ] **Task 9.1.3**: Implementar upload de foto de perfil (Supabase Storage)
- [ ] **Task 9.1.4**: Exibir plano atual e badge
- [ ] **Task 9.1.5**: Implementar atualização de perfil

### 9.2 Visualização de Perfil
- [ ] **Task 9.2.1**: Criar página de perfil próprio (/perfil)
- [ ] **Task 9.2.2**: Exibir informações do perfil
- [ ] **Task 9.2.3**: Criar seção de histórico:
  - Eventos confirmados
  - Serviços solicitados
  - Benefícios utilizados

### 9.3 Gestão de Plano
- [ ] **Task 9.3.1**: Criar interface de upgrade de plano
- [ ] **Task 9.3.2**: Integrar com sistema de pagamento (Stripe/PagSeguro)
- [ ] **Task 9.3.3**: Implementar downgrade/cancelamento

---

## 🎮 ÉPICO 10: GAMIFICAÇÃO (RETENÇÃO) - Estilo Skool

> **Referência**: Sistema de pontos e rankings do Skool - sutil mas eficaz

### 10.1 Sistema de Desafios e Pontos (Estilo Skool)
- [ ] **Task 10.1.1**: Criar tabela `challenges`
  - Campos: nome, descricao, tipo, pontos, prazo, ativo
- [ ] **Task 10.1.2**: Criar tabela `user_challenges` (progresso)
- [ ] **Task 10.1.3**: Implementar sistema de pontos estilo Skool (números grandes, destacados)
- [ ] **Task 10.1.4**: Criar tabela `user_points` (histórico de pontos)

### 10.2 UI de Gamificação (Estilo Skool)
- [ ] **Task 10.2.1**: Criar página de desafios (cards simples, estilo Skool)
- [ ] **Task 10.2.2**: Exibir progresso do usuário (números grandes, destacados no perfil)
- [ ] **Task 10.2.3**: Implementar badges de conquistas (ícones circulares, cores vibrantes)
- [ ] **Task 10.2.4**: Criar leaderboard simples (lista limpa, não complexa)
- [ ] **Task 10.2.5**: Exibir pontos no header/perfil (sempre visível, como Skool)

---

## 🐛 ÉPICO 11: CORREÇÕES URGENTES

### 11.1 Correções de Banco
- [ ] **Task 11.1.1**: Criar script de validação para evitar duplicatas futuras
- [ ] **Task 11.1.2**: Implementar constraint único em email/username

### 11.2 Correções de Copy (Landing Page)
- [ ] **Task 11.2.1**: **URGENTE** - Corrigir seção de Pricing
  - Alterar texto para deixar claro que US$ 999 é ENTRADA (Down Payment)
  - Novo texto: "Entrada de 50% (US$ 999) para iniciar a mentoria. O restante na 2ª fase."
  - Alterar CTA para "Garantir minha vaga com a entrada"
- [ ] **Task 11.2.2**: **URGENTE** - Corrigir títulos da equipe
  - Generalizar para "Especialista em Vistos" (remover especificidade F1/EB2)

---

## 🔧 ÉPICO 12: INFRAESTRUTURA E DEVOPS

### 12.1 Performance
- [ ] **Task 12.1.1**: Implementar cache de queries (React Query/SWR)
- [ ] **Task 12.1.2**: Otimizar imagens (Next.js Image)
- [ ] **Task 12.1.3**: Implementar lazy loading de componentes
- [ ] **Task 12.1.4**: Setup de CDN (se necessário)

### 12.2 Monitoramento
- [ ] **Task 12.2.1**: Configurar error tracking (Sentry)
- [ ] **Task 12.2.2**: Setup de analytics (Google Analytics / Plausible)
- [ ] **Task 12.2.3**: Implementar logging de ações importantes

### 12.3 Deploy
- [ ] **Task 12.3.1**: Configurar Vercel/Netlify para deploy
- [ ] **Task 12.3.2**: Setup de CI/CD (GitHub Actions)
- [ ] **Task 12.3.3**: Configurar domínio customizado
- [ ] **Task 12.3.4**: Setup de staging environment

---

## 📱 ÉPICO 13: MOBILE-FIRST E UX

### 13.1 Responsividade
- [ ] **Task 13.1.1**: Garantir que todas as telas sejam mobile-first
- [ ] **Task 13.1.2**: Testar em diferentes tamanhos de tela
- [ ] **Task 13.1.3**: Implementar menu inferior no mobile
- [ ] **Task 13.1.4**: Implementar menu lateral no desktop

### 13.2 Acessibilidade
- [ ] **Task 13.2.1**: Adicionar aria-labels
- [ ] **Task 13.2.2**: Garantir contraste adequado
- [ ] **Task 13.2.3**: Testar navegação por teclado
- [ ] **Task 13.2.4**: Implementar focus states

### 13.3 Performance Mobile
- [ ] **Task 13.3.1**: Otimizar bundle size
- [ ] **Task 13.3.2**: Implementar service worker (PWA opcional)
- [ ] **Task 13.3.3**: Testar performance em 3G/4G

---

## 🧪 ÉPICO 14: TESTES

### 14.1 Testes Unitários
- [ ] **Task 14.1.1**: Setup de Jest/Vitest
- [ ] **Task 14.1.2**: Testar funções utilitárias
- [ ] **Task 14.1.3**: Testar componentes críticos

### 14.2 Testes E2E
- [ ] **Task 14.2.1**: Setup de Playwright/Cypress
- [ ] **Task 14.2.2**: Testar fluxo de autenticação
- [ ] **Task 14.2.3**: Testar criação de post
- [ ] **Task 14.2.4**: Testar confirmação de evento

---

## 📚 ÉPICO 15: DOCUMENTAÇÃO

### 15.1 Documentação Técnica
- [ ] **Task 15.1.1**: Criar README.md com setup
- [ ] **Task 15.1.2**: Documentar estrutura de pastas
- [ ] **Task 15.1.3**: Documentar schema do banco
- [ ] **Task 15.1.4**: Documentar APIs/endpoints

### 15.2 Documentação de Usuário
- [ ] **Task 15.2.1**: Criar guia de uso básico
- [ ] **Task 15.2.2**: Documentar funcionalidades principais
- [ ] **Task 15.2.3**: Criar FAQ

---

## 🎯 PRIORIZAÇÃO SUGERIDA (MVP)

### FASE 1 - FUNDAÇÃO (Semanas 1-2)
1. Setup inicial e infraestrutura
2. Autenticação e usuários
3. Correções urgentes
4. Perfil básico

### FASE 2 - CORE (Semanas 3-4)
1. Feed/Comunidade (funcionalidade principal)
2. Membros/Diretório
3. Home/Dashboard

### FASE 3 - ENGAGEMENT (Semanas 5-6)
1. Eventos
2. Benefícios
3. Serviços/Marketplace básico

### FASE 4 - POLISH (Semanas 7-8)
1. Gamificação
2. Mobile-first refinamento
3. Testes básicos
4. Deploy

---

## 📝 NOTAS TÉCNICAS

### Stack Definida:
- **Frontend**: Vue.js 3 (Composition API)
- **Design**: HTML/CSS já desenvolvido pelos designers (aguardando entrega)
- **Styling**: CSS dos designers + Tailwind CSS (se necessário)
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Pinia (Vue.js)
- **Forms**: VeeValidate + Yup (ou Zod)
- **Ícones**: Lucide Icons ou Heroicons
- **Build Tool**: Vite
- **Deploy**: Vercel ou Netlify

### Referência de Design:
- **Principal**: [Skool.com](https://www.skool.com/) - Interface limpa, feed centralizado, gamificação sutil
- **Complementar**: Circle.so (estrutura), Twitter (feed simples)
- **Documentação**: Ver `DESIGN_SYSTEM_SKOOL.md` para detalhes completos

### Decisões Técnicas Pendentes:
- [ ] Escolher biblioteca de calendário para eventos
- [ ] Definir estratégia de notificações (email/push/in-app)
- [ ] Definir sistema de pagamento para planos
- [ ] Decidir sobre PWA (Progressive Web App)

---

**Total estimado de tasks**: ~150 tasks organizadas em 15 épicos

**Próximo passo**: Revisar e priorizar tasks conforme necessidade do MVP

