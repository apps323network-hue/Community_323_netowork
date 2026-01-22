# 🚀 Quick Start - Notificações de Programas

## ⚡ Instalação Rápida

### 1. Aplicar Migration
```bash
cd supabase
supabase db push
```

### 2. Deploy Edge Function
```bash
supabase functions deploy daily-program-notifications
```

### 3. Configurar GitHub Secrets
No GitHub Repository Settings > Secrets and variables > Actions:
- `SUPABASE_URL`: https://seu-projeto.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`: sua_service_role_key

### 4. Testar
```sql
-- Executar no SQL Editor do Supabase
\i supabase/migrations/test_program_notifications.sql
```

---

## 📋 Checklist de Configuração

- [ ] Migration aplicada (`20260120_program_notifications.sql`)
- [ ] Edge Function deployada (`daily-program-notifications`)
- [ ] Secrets configurados no GitHub
- [ ] GitHub Actions habilitado
- [ ] Testes executados com sucesso

---

## 🎯 O que foi implementado?

### ✅ Nova Aula Disponível (Automático)
Quando um professor adiciona uma nova aula com vídeo, todos os alunos matriculados recebem notificação.

### ⏰ Programa Iniciando (Diário às 9h UTC)
7 dias antes do início, alunos recebem lembrete.

### ⚠️ Programa Expirando (Diário às 9h UTC)
7 dias antes do término, alunos recebem aviso.

---

## 🧪 Teste Rápido

### Testar Nova Aula:
```sql
-- Inserir aula em um programa existente
INSERT INTO program_lessons (
  program_id, 
  title_pt, 
  youtube_video_id, 
  order_index
) VALUES (
  'seu-program-id',
  'Aula Teste',
  'dQw4w9WgXcQ',
  1
);

-- Ver notificações criadas
SELECT * FROM notifications 
WHERE type = 'new_lesson' 
ORDER BY created_at DESC LIMIT 5;
```

### Testar Verificações Diárias:
```sql
-- Executar manualmente
SELECT check_programs_starting_soon();
SELECT check_programs_expiring_soon();
```

---

## 📚 Documentação Completa
Ver: `docs/PROGRAM_NOTIFICATIONS.md`

## 🐛 Problemas?
1. Verificar logs: `supabase functions logs daily-program-notifications`
2. Ver triggers: `SELECT * FROM pg_trigger WHERE tgname LIKE '%notify%'`
3. Testar Edge Function: GitHub Actions > Run workflow

---

## 🎨 Frontend

As notificações aparecem automaticamente no sino de notificações com:
- 🎬 Ícone azul para novas aulas
- 🎓 Ícone verde para programa iniciando
- 🎓 Ícone laranja para programa expirando

Clique na notificação para ir direto ao programa!
