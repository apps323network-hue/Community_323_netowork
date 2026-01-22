# 🚀 GUIA DE INSTALAÇÃO MANUAL - Notificações de Programas

## ⚠️ IMPORTANTE
Como o Supabase CLI está com problemas de sincronização, vamos aplicar manualmente via Dashboard.

---

## 📋 PASSO A PASSO

### **1️⃣ Acessar o SQL Editor do Supabase**

1. Abra seu navegador
2. Acesse: https://supabase.com/dashboard
3. Selecione seu projeto
4. No menu lateral, clique em **SQL Editor**
5. Clique em **+ New query**

---

### **2️⃣ Copiar e Executar o Script**

1. Abra o arquivo: `supabase/migrations/APPLY_MANUALLY_program_notifications.sql`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)

---

### **3️⃣ Verificar Sucesso**

Você deve ver na saída:

```
✅ notify_students_new_lesson - Criada com sucesso
✅ check_programs_starting_soon - Criada com sucesso  
✅ check_programs_expiring_soon - Criada com sucesso
✅ trigger_notify_new_lesson - Ativo
```

Se aparecer algum erro, copie a mensagem e me envie.

---

### **4️⃣ Testar o Sistema**

Execute este teste rápido no SQL Editor:

```sql
-- Buscar um programa existente
SELECT id, title_pt FROM programs LIMIT 1;

-- Copie o ID do programa e use abaixo:
INSERT INTO program_lessons (
  program_id,
  title_pt,
  title_en,
  youtube_video_id,
  order_index
) VALUES (
  'COLE-O-ID-DO-PROGRAMA-AQUI',
  'Aula Teste - Notificações',
  'Test Lesson - Notifications',
  'dQw4w9WgXcQ',
  999
);

-- Verificar se a notificação foi criada
SELECT 
  n.type,
  n.title,
  n.content,
  n.metadata->>'lesson_title' as lesson,
  n.created_at
FROM notifications n
WHERE n.type = 'new_lesson'
ORDER BY n.created_at DESC
LIMIT 5;
```

Se aparecer a notificação, **SUCESSO!** ✅

---

### **5️⃣ Limpar Teste (Opcional)**

```sql
-- Deletar a aula de teste
DELETE FROM program_lessons 
WHERE title_pt = 'Aula Teste - Notificações';

-- Deletar a notificação de teste
DELETE FROM notifications 
WHERE type = 'new_lesson' 
  AND metadata->>'lesson_title' = 'Aula Teste - Notificações';
```

---

## 🎯 PRÓXIMOS PASSOS

### **Deploy da Edge Function** (Opcional - para notificações agendadas)

Se você quiser ativar as notificações de "Programa Iniciando" e "Programa Expirando":

1. Instalar Supabase CLI (se ainda não tiver):
   ```bash
   npm install -g supabase
   ```

2. Login:
   ```bash
   supabase login
   ```

3. Link ao projeto:
   ```bash
   supabase link --project-ref SEU_PROJECT_REF
   ```

4. Deploy:
   ```bash
   supabase functions deploy daily-program-notifications
   ```

5. Configurar GitHub Actions (ver `docs/PROGRAM_NOTIFICATIONS.md`)

---

## ✅ CHECKLIST

- [ ] Script SQL executado com sucesso
- [ ] Funções criadas (3)
- [ ] Trigger criado (1)
- [ ] Teste realizado
- [ ] Notificação de teste apareceu
- [ ] Teste limpo (opcional)
- [ ] Edge Function deployada (opcional)
- [ ] GitHub Actions configurado (opcional)

---

## 🆘 PROBLEMAS?

### Erro: "relation 'program_lessons' does not exist"
- Verifique se a tabela existe: `SELECT * FROM program_lessons LIMIT 1;`
- Se não existir, você precisa aplicar as migrations anteriores primeiro

### Erro: "permission denied"
- Certifique-se de estar usando o SQL Editor como admin
- Tente executar cada função separadamente

### Notificação não aparece
1. Verifique se há alunos matriculados: 
   ```sql
   SELECT * FROM program_enrollments 
   WHERE program_id = 'SEU_ID' 
     AND status = 'active' 
     AND payment_status = 'paid';
   ```
2. Verifique se o youtube_video_id não está vazio
3. Veja os logs: `SHOW client_min_messages;` (deve ser NOTICE ou maior)

---

## 📞 SUPORTE

Se encontrar problemas:
1. Copie a mensagem de erro completa
2. Tire um print da tela
3. Me envie para análise

**Sistema pronto para uso após estes passos!** 🎉
