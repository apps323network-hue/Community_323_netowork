# 📚 Sistema de Notificações de Programas

Este documento descreve o sistema de notificações automáticas para programas matriculados.

## 🎯 Funcionalidades Implementadas

### 1. **Nova Aula Disponível** ✅ Automático
- **Trigger**: Quando uma nova aula com vídeo é adicionada ao programa
- **Destinatários**: Todos os alunos matriculados (status: active, payment_status: paid)
- **Tipo**: `new_lesson`
- **Ícone**: 🎬 (play_circle) - Azul
- **Navegação**: Redireciona para `/programas/{program_id}`

### 2. **Programa Iniciando em Breve** ⏰ Agendado
- **Trigger**: 7 dias antes da data de início do programa
- **Destinatários**: Todos os alunos matriculados
- **Tipo**: `program_starting`
- **Ícone**: 🎓 (school) - Verde
- **Navegação**: Redireciona para `/programas/{program_id}`
- **Frequência**: Verificação diária às 9h UTC (6h BRT)

### 3. **Programa Expirando em Breve** ⚠️ Agendado
- **Trigger**: 7 dias antes da data de término do programa
- **Destinatários**: Todos os alunos matriculados
- **Tipo**: `program_expiring`
- **Ícone**: 🎓 (school) - Laranja
- **Navegação**: Redireciona para `/programas/{program_id}`
- **Frequência**: Verificação diária às 9h UTC (6h BRT)

---

## 🛠️ Configuração

### Passo 1: Aplicar Migration
```bash
# A migration já foi criada em:
supabase/migrations/20260120_program_notifications.sql

# Aplicar via Supabase CLI:
supabase db push

# Ou aplicar manualmente no Dashboard do Supabase
```

### Passo 2: Deploy da Edge Function
```bash
# Deploy da função de verificação diária
supabase functions deploy daily-program-notifications

# Testar manualmente
supabase functions invoke daily-program-notifications
```

### Passo 3: Configurar Secrets no GitHub
No repositório GitHub, adicione os seguintes secrets:

1. **SUPABASE_URL**
   - Valor: URL do seu projeto Supabase
   - Exemplo: `https://xxxxx.supabase.co`

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Valor: Service Role Key do Supabase
   - Encontre em: Project Settings > API > service_role

### Passo 4: Ativar GitHub Actions
O workflow já está configurado em:
```
.github/workflows/daily-program-notifications.yml
```

Ele executará automaticamente todos os dias às 9h UTC (6h BRT).

Para testar manualmente:
1. Vá para Actions no GitHub
2. Selecione "Daily Program Notifications"
3. Clique em "Run workflow"

---

## 📊 Estrutura de Dados

### Metadata das Notificações

#### Nova Aula:
```json
{
  "program_id": "uuid",
  "program_title": "Nome do Programa",
  "lesson_id": "uuid",
  "lesson_title": "Título da Aula"
}
```

#### Programa Iniciando:
```json
{
  "program_id": "uuid",
  "program_title": "Nome do Programa",
  "days": 7,
  "start_date": "2026-01-27"
}
```

#### Programa Expirando:
```json
{
  "program_id": "uuid",
  "program_title": "Nome do Programa",
  "days": 7,
  "end_date": "2026-01-27"
}
```

---

## 🔍 Testes

### Testar Nova Aula (Automático)
```sql
-- Inserir uma nova aula em um programa
INSERT INTO program_lessons (
  program_id,
  title_pt,
  title_en,
  youtube_video_id,
  order_index
) VALUES (
  'seu-program-id',
  'Aula de Teste',
  'Test Lesson',
  'dQw4w9WgXcQ',
  1
);

-- Verificar notificações criadas
SELECT * FROM notifications 
WHERE type = 'new_lesson' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Testar Programa Iniciando (Manual)
```sql
-- Chamar a função manualmente
SELECT check_programs_starting_soon();

-- Verificar notificações
SELECT * FROM notifications 
WHERE type = 'program_starting' 
ORDER BY created_at DESC;
```

### Testar Programa Expirando (Manual)
```sql
-- Chamar a função manualmente
SELECT check_programs_expiring_soon();

-- Verificar notificações
SELECT * FROM notifications 
WHERE type = 'program_expiring' 
ORDER BY created_at DESC;
```

---

## 🚨 Troubleshooting

### Notificações não estão sendo criadas?

1. **Verificar se o trigger está ativo:**
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_notify_new_lesson';
```

2. **Verificar logs da função:**
```sql
-- Habilitar logs
SET client_min_messages TO NOTICE;

-- Inserir aula de teste
INSERT INTO program_lessons (...) VALUES (...);
```

3. **Verificar matrículas ativas:**
```sql
SELECT * FROM program_enrollments 
WHERE program_id = 'seu-program-id' 
  AND status = 'active' 
  AND payment_status = 'paid';
```

### GitHub Actions não está executando?

1. Verificar se os secrets estão configurados
2. Verificar logs em Actions > Daily Program Notifications
3. Testar manualmente via "Run workflow"

### Edge Function retornando erro?

```bash
# Ver logs da função
supabase functions logs daily-program-notifications

# Testar localmente
supabase functions serve daily-program-notifications
```

---

## 📈 Melhorias Futuras

- [ ] Adicionar notificação de matrícula confirmada
- [ ] Adicionar marcos de progresso (25%, 50%, 75%, 100%)
- [ ] Adicionar notificação de certificado emitido
- [ ] Permitir usuários configurarem preferências de notificação
- [ ] Adicionar notificações por email (além de in-app)
- [ ] Dashboard de analytics de notificações

---

## 🔗 Arquivos Relacionados

- **Migration**: `supabase/migrations/20260120_program_notifications.sql`
- **Edge Function**: `supabase/functions/daily-program-notifications/index.ts`
- **GitHub Workflow**: `.github/workflows/daily-program-notifications.yml`
- **Frontend**: `src/components/layout/NotificationsDropdown.vue`
- **Traduções**: 
  - `src/i18n/locales/en-US.json`
  - `src/i18n/locales/pt-BR.json`
