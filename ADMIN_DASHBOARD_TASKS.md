# 📋 ADMIN DASHBOARD - PLANO DE IMPLEMENTAÇÃO

## 🎯 DECISÕES TOMADAS

- ✅ **Aprovação Manual Obrigatória**: Todos os novos membros precisam ser aprovados antes de acessar o site
- ✅ **Pré-moderação de Posts**: Todos os posts precisam de aprovação prévia antes de serem publicados
- ✅ **Tipo de Admin**: Apenas 1 tipo de admin (sem níveis)
- ✅ **Sistema de Strikes**: 3 strikes = ban automático
- ⏳ **Notificações**: Será implementado depois

---

## 📊 FASE 1 - ESSENCIAL (MVP)

### 16. Sistema de Aprovação de Membros

#### Task 1.1.1: Migração de Banco - Status de Usuário
- [ ] Criar migration para adicionar campo `status` na tabela `profiles`
- [ ] Valores: `'pending'`, `'active'`, `'suspended'`, `'banned'`
- [ ] Adicionar campo `approved_by` (UUID do admin que aprovou)
- [ ] Adicionar campo `approved_at` (timestamp)
- [ ] Adicionar campo `rejection_reason` (texto opcional)
- [ ] Adicionar campo `strikes` (integer, default 0)
- [ ] Criar índices para performance

#### Task 1.1.2: Atualizar Store de Usuários
- [ ] Adicionar função `fetchPendingUsers()` no `userStore` ou criar `adminStore`
- [ ] Adicionar função `approveUser(userId, adminId)`
- [ ] Adicionar função `rejectUser(userId, reason, adminId)`
- [ ] Adicionar função `suspendUser(userId, days, reason, adminId)`
- [ ] Adicionar função `banUser(userId, reason, adminId)`
- [ ] Adicionar função `addStrike(userId, reason, adminId)`

#### Task 1.1.3: RLS (Row Level Security) - Usuários
- [ ] Criar política: Usuários com status `pending` não podem ver conteúdo
- [ ] Criar política: Apenas admins podem ver usuários pendentes
- [ ] Criar política: Usuários ativos podem ver outros usuários ativos
- [ ] Criar política: Usuários suspensos/banidos não podem acessar

#### Task 1.1.4: Componente - Lista de Usuários Pendentes
- [ ] Criar componente `AdminPendingUsersList.vue`
- [ ] Exibir: nome, email, área de atuação, data de cadastro
- [ ] Botões: Ver Perfil, Aprovar, Rejeitar
- [ ] Modal de confirmação para aprovar/rejeitar
- [ ] Campo de motivo ao rejeitar

#### Task 1.1.5: Componente - Lista de Todos os Usuários
- [ ] Criar componente `AdminUsersList.vue`
- [ ] Filtros: status (todos, ativos, pendentes, suspensos, banidos)
- [ ] Busca por nome, email, área
- [ ] Ações: Suspender, Banir, Remover Suspensão, Ver Histórico
- [ ] Exibir número de strikes

#### Task 1.1.6: Página - Dashboard de Membros
- [ ] Criar página `/admin/membros`
- [ ] Tabs: Pendentes, Todos, Suspensos, Banidos
- [ ] Estatísticas: Total, Pendentes, Novos Hoje
- [ ] Integrar componentes criados

---

### 1.2. Sistema de Pré-moderação de Posts

#### Task 1.2.1: Migração de Banco - Status de Posts
- [ ] Adicionar campo `status` na tabela `posts` (se não existir)
- [ ] Valores: `'pending'`, `'approved'`, `'hidden'`, `'removed'`, `'spam'`
- [ ] Adicionar campo `approved_by` (UUID do admin)
- [ ] Adicionar campo `approved_at` (timestamp)
- [ ] Adicionar campo `rejection_reason` (texto)
- [ ] Adicionar campo `strikes_added` (boolean - se adicionou strike ao autor)
- [ ] Criar índices

#### Task 1.2.2: Atualizar Store de Posts
- [ ] Modificar `fetchPosts()` para filtrar apenas posts `approved`
- [ ] Adicionar função `fetchPendingPosts()` (apenas admin)
- [ ] Adicionar função `approvePost(postId, adminId)`
- [ ] Adicionar função `hidePost(postId, reason, adminId)`
- [ ] Adicionar função `removePost(postId, reason, adminId, addStrike)`
- [ ] Adicionar função `markAsSpam(postId, adminId)`

#### Task 1.2.3: RLS - Posts
- [ ] Criar política: Apenas posts `approved` são visíveis para usuários
- [ ] Criar política: Criador pode ver seu próprio post mesmo se `pending`
- [ ] Criar política: Admin pode ver todos os posts
- [ ] Criar política: Posts `removed` não são visíveis para ninguém (exceto admin)

#### Task 1.2.4: Componente - Lista de Posts Pendentes
- [ ] Criar componente `AdminPendingPostsList.vue`
- [ ] Exibir: autor, conteúdo (truncado), data, preview de imagem
- [ ] Botões: Ver Completo, Aprovar, Ocultar, Remover, Marcar Spam
- [ ] Modal de confirmação com campo de motivo

#### Task 1.2.5: Componente - Visualização de Post Completo
- [ ] Criar componente `AdminPostView.vue`
- [ ] Exibir post completo com todas as informações
- [ ] Mostrar comentários associados
- [ ] Mostrar curtidas
- [ ] Ações de moderação

#### Task 1.2.6: Página - Dashboard de Posts
- [ ] Criar página `/admin/posts`
- [ ] Tabs: Pendentes, Reportados, Todos, Ocultos, Spam
- [ ] Estatísticas: Total, Pendentes, Removidos Hoje
- [ ] Integrar componentes criados

---

### 1.3. Sistema de Palavras Proibidas

#### Task 1.3.1: Migração de Banco - Tabela de Palavras Proibidas
- [ ] Criar tabela `banned_words`
- [ ] Campos: `id`, `word` (texto, único), `category` (texto), `action` (texto: 'block', 'warn', 'replace')
- [ ] Campo `created_by` (UUID do admin)
- [ ] Campo `created_at` (timestamp)
- [ ] Criar índices

#### Task 1.3.2: Função de Verificação
- [ ] Criar função `checkBannedWords(content: string)`
- [ ] Retornar: palavras encontradas, ação a tomar
- [ ] Suportar palavras parciais e frases completas
- [ ] Case-insensitive

#### Task 1.3.3: Integração na Criação de Posts
- [ ] Ao criar post, verificar palavras proibidas
- [ ] Se `action = 'block'`: não permitir criação, mostrar erro
- [ ] Se `action = 'warn'`: criar como `pending`, notificar admin
- [ ] Se `action = 'replace'`: substituir por asteriscos, criar normalmente

#### Task 1.3.4: Componente - Gerenciar Palavras Proibidas
- [ ] Criar componente `AdminBannedWords.vue`
- [ ] Lista de palavras com categoria e ação
- [ ] Adicionar palavra (modal)
- [ ] Editar palavra
- [ ] Remover palavra
- [ ] Importar lista (CSV)
- [ ] Busca e filtros

#### Task 1.3.5: Página - Configurações de Palavras
- [ ] Criar página `/admin/palavras-proibidas`
- [ ] Integrar componente de gerenciamento
- [ ] Estatísticas: Total de palavras, palavras bloqueadas hoje

---

### 1.4. Sistema de Strikes

#### Task 1.4.1: Migração de Banco - Tabela de Strikes
- [ ] Criar tabela `user_strikes`
- [ ] Campos: `id`, `user_id` (UUID), `reason` (texto), `admin_id` (UUID)
- [ ] Campo `post_id` (UUID opcional - se strike foi por post)
- [ ] Campo `created_at` (timestamp)
- [ ] Criar índice em `user_id`

#### Task 1.4.2: Lógica de Strikes
- [ ] Ao adicionar strike, verificar se usuário tem 3 strikes
- [ ] Se tiver 3 strikes: banir automaticamente
- [ ] Notificar usuário sobre strike adicionado
- [ ] Notificar usuário sobre ban automático (se aplicável)

#### Task 1.4.3: Componente - Histórico de Strikes
- [ ] Criar componente `UserStrikesHistory.vue`
- [ ] Exibir todos os strikes de um usuário
- [ ] Mostrar: data, motivo, admin responsável, post relacionado (se houver)
- [ ] Exibir total de strikes

#### Task 1.4.4: Integração nas Ações de Moderação
- [ ] Ao remover post: opção "Adicionar strike ao autor"
- [ ] Ao marcar como spam: adicionar strike automaticamente
- [ ] Ao ocultar post: opção de adicionar strike

---

### 1.5. Dashboard Principal

#### Task 1.5.1: Componente - Cards de Métricas
- [ ] Criar componente `AdminMetricsCards.vue`
- [ ] Card: Total de Membros (ativos, pendentes, suspensos, banidos)
- [ ] Card: Total de Posts (pendentes, aprovados hoje, removidos hoje)
- [ ] Card: Total de Eventos (pendentes, aprovados hoje)
- [ ] Card: Ações Hoje (aprovações, remoções, strikes)

#### Task 1.5.2: Componente - Gráficos Básicos
- [ ] Criar componente `AdminCharts.vue`
- [ ] Gráfico: Crescimento de Membros (últimos 30 dias)
- [ ] Gráfico: Posts por Dia (últimos 7 dias)
- [ ] Usar biblioteca de gráficos (Chart.js ou similar)

#### Task 1.5.3: Página - Dashboard Principal
- [ ] Criar página `/admin` ou `/admin/dashboard`
- [ ] Layout com sidebar de navegação
- [ ] Integrar cards de métricas
- [ ] Integrar gráficos
- [ ] Lista rápida: Últimos membros pendentes, Últimos posts pendentes

---

## 📊 FASE 2 - IMPORTANTE

### 2.1. Sistema de Reports

#### Task 2.1.1: Migração de Banco - Tabela de Reports
- [ ] Criar tabela `reports`
- [ ] Campos: `id`, `reported_by` (UUID), `reported_item_type` (texto: 'post', 'user', 'comment')
- [ ] Campo `reported_item_id` (UUID)
- [ ] Campo `reason` (texto: 'spam', 'inappropriate', 'harassment', 'fake_news', 'other')
- [ ] Campo `description` (texto opcional)
- [ ] Campo `status` (texto: 'pending', 'reviewed', 'resolved', 'dismissed')
- [ ] Campo `resolved_by` (UUID do admin)
- [ ] Campo `resolved_at` (timestamp)
- [ ] Criar índices

#### Task 2.1.2: Funcionalidade de Reportar
- [ ] Adicionar botão "Reportar" em posts
- [ ] Modal de report com seleção de motivo
- [ ] Campo de descrição opcional
- [ ] Ao reportar, criar registro na tabela `reports`

#### Task 2.1.3: Componente - Lista de Reports
- [ ] Criar componente `AdminReportsList.vue`
- [ ] Exibir: tipo de item, motivo, quem reportou, quando
- [ ] Filtros: pendentes, resolvidos, todos
- [ ] Ordenar por: mais reports, mais recente
- [ ] Agrupar reports do mesmo item

#### Task 2.1.4: Componente - Resolver Report
- [ ] Modal para resolver report
- [ ] Ações: Remover conteúdo, Suspender usuário, Ignorar, Dismiss
- [ ] Campo de observação interna

#### Task 2.1.5: Página - Dashboard de Reports
- [ ] Criar página `/admin/reports`
- [ ] Integrar componentes
- [ ] Estatísticas: Reports pendentes, Resolvidos hoje

---

### 2.2. Suspensão e Banimento

#### Task 2.2.1: Componente - Modal de Suspensão
- [ ] Criar componente `SuspendUserModal.vue`
- [ ] Opções: 1 dia, 7 dias, 30 dias, permanente
- [ ] Campo de motivo obrigatório
- [ ] Checkbox: "Adicionar strike"

#### Task 2.2.2: Componente - Modal de Banimento
- [ ] Criar componente `BanUserModal.vue`
- [ ] Campo de motivo obrigatório
- [ ] Aviso de confirmação (ação irreversível)
- [ ] Opção de remover todos os posts do usuário

#### Task 2.2.3: Lógica de Suspensão
- [ ] Ao suspender, atualizar `status` para `'suspended'`
- [ ] Adicionar campo `suspended_until` (timestamp)
- [ ] Verificar automaticamente se suspensão expirou
- [ ] Ao expirar, voltar status para `'active'`

#### Task 2.2.4: Lógica de Banimento
- [ ] Ao banir, atualizar `status` para `'banned'`
- [ ] Bloquear acesso imediatamente (RLS)
- [ ] Opcional: remover todos os posts

---

### 2.3. Logs de Auditoria

#### Task 2.3.1: Migração de Banco - Tabela de Logs
- [ ] Criar tabela `admin_logs`
- [ ] Campos: `id`, `admin_id` (UUID), `action_type` (texto)
- [ ] Campo `target_type` (texto: 'user', 'post', 'event', etc.)
- [ ] Campo `target_id` (UUID)
- [ ] Campo `details` (JSONB - informações adicionais)
- [ ] Campo `ip_address` (texto)
- [ ] Campo `created_at` (timestamp)
- [ ] Criar índices

#### Task 2.3.2: Função de Logging
- [ ] Criar função `logAdminAction(action, targetType, targetId, details)`
- [ ] Registrar todas as ações administrativas
- [ ] Incluir IP do admin
- [ ] Incluir timestamp

#### Task 2.3.3: Componente - Visualização de Logs
- [ ] Criar componente `AdminLogsView.vue`
- [ ] Lista de logs com filtros
- [ ] Filtros: por admin, por tipo de ação, por data
- [ ] Busca
- [ ] Exportar logs (CSV)

#### Task 2.3.4: Integração em Todas as Ações
- [ ] Adicionar logging em: aprovar/rejeitar usuário
- [ ] Adicionar logging em: aprovar/remover post
- [ ] Adicionar logging em: suspender/banir usuário
- [ ] Adicionar logging em: adicionar strike
- [ ] Adicionar logging em: aprovar/rejeitar evento

---

### 2.4. Histórico de Usuários

#### Task 2.4.1: Componente - Histórico Completo
- [ ] Criar componente `UserHistoryView.vue`
- [ ] Exibir: strikes, suspensões, posts removidos, reports recebidos
- [ ] Timeline de ações
- [ ] Filtros por tipo de ação

#### Task 2.4.2: Integração na Página de Usuários
- [ ] Adicionar botão "Ver Histórico" em cada usuário
- [ ] Modal ou página dedicada com histórico completo

---

## 📊 FASE 3 - MELHORIAS

### 3.1. Analytics Avançados

#### Task 3.1.1: Componente - Gráficos Avançados
- [ ] Gráfico: Engajamento (curtidas, comentários, compartilhamentos)
- [ ] Gráfico: Top Membros Mais Ativos
- [ ] Gráfico: Posts Mais Engajados
- [ ] Gráfico: Horários de Maior Atividade

#### Task 3.1.2: Relatórios Exportáveis
- [ ] Função para gerar relatório de moderação (PDF/CSV)
- [ ] Função para gerar relatório de crescimento (PDF/CSV)
- [ ] Função para gerar relatório de engajamento (PDF/CSV)

---

### 3.2. Configurações do Site

#### Task 3.2.1: Migração de Banco - Tabela de Configurações
- [ ] Criar tabela `site_settings`
- [ ] Campos: `key` (texto, único), `value` (JSONB), `updated_by` (UUID), `updated_at` (timestamp)

#### Task 3.2.2: Configurações Básicas
- [ ] Toggle: Aprovação manual de membros (on/off)
- [ ] Toggle: Pré-moderação de posts (on/off)
- [ ] Campo: Limite de posts por usuário por dia
- [ ] Campo: Mensagem de boas-vindas

#### Task 3.2.3: Componente - Página de Configurações
- [ ] Criar página `/admin/configuracoes`
- [ ] Formulário com todas as configurações
- [ ] Salvar alterações

---

### 3.3. Gestão de Conteúdo Destacado

#### Task 3.3.1: Funcionalidade de Fixar Posts
- [ ] Adicionar campo `is_pinned` na tabela `posts`
- [ ] Componente para fixar/desfixar posts
- [ ] Ordenar posts fixados primeiro

#### Task 3.3.2: Banners e Avisos
- [ ] Criar tabela `site_banners`
- [ ] Campos: `id`, `title`, `message`, `type` (info, warning, success), `is_active`, `created_by`
- [ ] Componente para criar/editar banners
- [ ] Exibir banners no topo do site

---

## 🎨 INTERFACE E UX

### 4.1. Layout do Dashboard

#### Task 4.1.1: Componente - Sidebar de Navegação
- [ ] Criar componente `AdminSidebar.vue`
- [ ] Links: Dashboard, Membros, Posts, Eventos, Reports, Configurações, Logs
- [ ] Badges com contadores (ex: membros pendentes)
- [ ] Responsivo (colapsável no mobile)

#### Task 4.1.2: Layout Principal
- [ ] Criar componente `AdminLayout.vue`
- [ ] Header com: logo, nome do admin, logout
- [ ] Sidebar + conteúdo principal
- [ ] Breadcrumbs

#### Task 4.1.3: Responsividade
- [ ] Mobile-first design
- [ ] Sidebar colapsável no mobile
- [ ] Cards empilhados no mobile
- [ ] Tabelas responsivas (scroll horizontal)

---

### 4.2. Componentes Reutilizáveis

#### Task 4.2.1: Componente - Modal de Confirmação
- [ ] Criar componente `AdminConfirmModal.vue`
- [ ] Props: título, mensagem, tipo (danger, warning, info)
- [ ] Botões: Confirmar, Cancelar

#### Task 4.2.2: Componente - Badge de Status
- [ ] Criar componente `StatusBadge.vue`
- [ ] Cores diferentes para cada status
- [ ] Reutilizável em toda a aplicação

#### Task 4.2.3: Componente - Tabela Administrativa
- [ ] Criar componente `AdminTable.vue`
- [ ] Props: colunas, dados, ações
- [ ] Suporte a ordenação, filtros, paginação

---

## 🔒 SEGURANÇA

### 5.1. RLS (Row Level Security)

#### Task 5.1.1: Políticas de Acesso
- [ ] Revisar todas as políticas RLS
- [ ] Garantir que usuários pendentes não vejam conteúdo
- [ ] Garantir que usuários suspensos/banidos não acessem
- [ ] Garantir que apenas admins vejam dados administrativos

#### Task 5.1.2: Validações no Backend
- [ ] Validar role de admin antes de ações administrativas
- [ ] Validar permissões em todas as funções do adminStore
- [ ] Rate limiting para ações administrativas

---

### 5.2. Proteções

#### Task 5.2.1: Confirmações para Ações Destrutivas
- [ ] Modal de confirmação para banir usuário
- [ ] Modal de confirmação para remover post permanentemente
- [ ] Modal de confirmação para ações irreversíveis

#### Task 5.2.2: Reversão de Ações
- [ ] Função para remover ban (se necessário)
- [ ] Função para restaurar post removido
- [ ] Função para remover strike (com justificativa)

---

## 📝 ROTAS E NAVEGAÇÃO

### 6.1. Rotas do Admin

#### Task 6.1.1: Adicionar Rotas
- [ ] `/admin` - Dashboard principal
- [ ] `/admin/membros` - Gestão de membros
- [ ] `/admin/posts` - Gestão de posts
- [ ] `/admin/eventos` - Gestão de eventos (já existe, revisar)
- [ ] `/admin/reports` - Gestão de reports
- [ ] `/admin/palavras-proibidas` - Palavras proibidas
- [ ] `/admin/configuracoes` - Configurações
- [ ] `/admin/logs` - Logs de auditoria

#### Task 6.1.2: Guards de Rota
- [ ] Verificar se usuário é admin em todas as rotas `/admin/*`
- [ ] Redirecionar para home se não for admin
- [ ] Mostrar mensagem de erro apropriada

---

## 🧪 TESTES

### 7.1. Testes de Funcionalidade

#### Task 7.1.1: Testes de Aprovação de Membros
- [ ] Testar aprovação de membro pendente
- [ ] Testar rejeição de membro
- [ ] Testar que membro pendente não vê conteúdo

#### Task 7.1.2: Testes de Moderação de Posts
- [ ] Testar aprovação de post
- [ ] Testar remoção de post
- [ ] Testar que post pendente não é visível
- [ ] Testar sistema de palavras proibidas

#### Task 7.1.3: Testes de Strikes
- [ ] Testar adicionar strike
- [ ] Testar ban automático após 3 strikes
- [ ] Testar histórico de strikes

---

## 📦 DEPENDÊNCIAS NECESSÁRIAS

- [ ] Biblioteca de gráficos (Chart.js ou similar)
- [ ] Biblioteca de exportação PDF (se necessário)
- [ ] Biblioteca de exportação CSV (se necessário)

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO SUGERIDA

### Sprint 1 (MVP - Aprovação de Membros)
1. Task 1.1.1 - Migração de Status de Usuário
2. Task 1.1.2 - Atualizar Store
3. Task 1.1.3 - RLS de Usuários
4. Task 1.1.4 - Componente Lista Pendentes
5. Task 1.1.5 - Componente Lista Todos
6. Task 1.1.6 - Página Dashboard Membros
7. Task 4.1.1 - Sidebar Admin
8. Task 4.1.2 - Layout Admin
9. Task 6.1.1 - Rotas Admin

### Sprint 2 (MVP - Moderação de Posts)
1. Task 1.2.1 - Migração Status Posts
2. Task 1.2.2 - Atualizar Store Posts
3. Task 1.2.3 - RLS Posts
4. Task 1.2.4 - Componente Lista Pendentes
5. Task 1.2.5 - Componente Visualização
6. Task 1.2.6 - Página Dashboard Posts

### Sprint 3 (MVP - Palavras Proibidas)
1. Task 1.3.1 - Migração Tabela
2. Task 1.3.2 - Função Verificação
3. Task 1.3.3 - Integração Criação Posts
4. Task 1.3.4 - Componente Gerenciamento
5. Task 1.3.5 - Página Configurações

### Sprint 4 (MVP - Strikes e Dashboard)
1. Task 1.4.1 - Migração Strikes
2. Task 1.4.2 - Lógica Strikes
3. Task 1.4.3 - Componente Histórico
4. Task 1.4.4 - Integração Moderação
5. Task 1.5.1 - Cards Métricas
6. Task 1.5.2 - Gráficos Básicos
7. Task 1.5.3 - Dashboard Principal

### Sprint 5 (Fase 2 - Reports)
1. Task 2.1.1 - Migração Reports
2. Task 2.1.2 - Funcionalidade Reportar
3. Task 2.1.3 - Componente Lista
4. Task 2.1.4 - Componente Resolver
5. Task 2.1.5 - Página Dashboard

### Sprint 6 (Fase 2 - Suspensão/Ban e Logs)
1. Task 2.2.1 - Modal Suspensão
2. Task 2.2.2 - Modal Banimento
3. Task 2.2.3 - Lógica Suspensão
4. Task 2.2.4 - Lógica Banimento
5. Task 2.3.1 - Migração Logs
6. Task 2.3.2 - Função Logging
7. Task 2.3.3 - Componente Visualização
8. Task 2.3.4 - Integração Ações
9. Task 2.4.1 - Histórico Usuários
10. Task 2.4.2 - Integração Página

---

## 📌 NOTAS IMPORTANTES

- Todas as ações administrativas devem ser logadas
- Confirmações obrigatórias para ações destrutivas
- Sistema de strikes: 3 strikes = ban automático
- Usuários pendentes não podem ver conteúdo até serem aprovados
- Posts precisam de aprovação prévia antes de serem publicados
- Apenas 1 tipo de admin (sem níveis)
- Notificações serão implementadas depois

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Todas as migrations criadas e aplicadas
- [ ] Todas as stores atualizadas
- [ ] Todas as políticas RLS implementadas
- [ ] Todos os componentes criados
- [ ] Todas as páginas criadas
- [ ] Rotas configuradas
- [ ] Guards de segurança implementados
- [ ] Testes básicos realizados
- [ ] Documentação atualizada

