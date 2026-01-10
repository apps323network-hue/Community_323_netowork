# 📦 Guia de Instalação do Supabase CLI

Este guia explica como instalar e configurar o Supabase CLI para trabalhar com este projeto.

---

## 🚀 Métodos de Instalação

### **Opção 1: Via npm (Recomendado - Já Configurado)**

O Supabase CLI já está configurado como dependência de desenvolvimento no `package.json`. Para instalar:

```bash
npm install
```

Após a instalação, você pode usar o CLI através do `npx`:

```bash
# Verificar versão
npx supabase --version

# Ver ajuda
npx supabase --help
```

**Vantagens:**
- ✅ Não requer instalação global
- ✅ Versão consistente entre todos os desenvolvedores
- ✅ Funciona automaticamente após `npm install`

---

### **Opção 2: Instalação Global via npm**

Se preferir ter o CLI disponível globalmente:

```bash
npm install -g supabase
```

**Verificar instalação:**
```bash
supabase --version
```

---

### **Opção 3: Via Scoop (Windows)**

Se você usa o gerenciador de pacotes Scoop no Windows:

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

---

### **Opção 4: Via Chocolatey (Windows)**

Se você usa o Chocolatey:

```bash
choco install supabase
```

---

### **Opção 5: Download Manual (Windows)**

1. Acesse: https://github.com/supabase/cli/releases
2. Baixe o arquivo `supabase_windows_amd64.zip` (ou a versão apropriada para sua arquitetura)
3. Extraia o arquivo
4. Adicione o diretório ao PATH do sistema

---

## 🔧 Configuração Inicial

### 1. Login no Supabase

Primeiro, você precisa fazer login na sua conta Supabase:

```bash
npx supabase login
```

Ou se instalou globalmente:

```bash
supabase login
```

Isso abrirá seu navegador para autenticação.

---

### 2. Vincular ao Projeto Remoto

Para vincular este projeto ao seu projeto Supabase remoto:

```bash
npx supabase link --project-ref pgdvbanwumqjmqeybqnw
```

**Nota:** O `project-ref` do 323 Network é: `pgdvbanwumqjmqeybqnw`

Isso criará um arquivo `.supabase/config.toml` com as configurações do projeto.

---

### 3. Inicializar o Supabase Local (Opcional)

Se você quiser rodar o Supabase localmente para desenvolvimento:

```bash
# Iniciar serviços locais (PostgreSQL, Auth, Storage, etc.)
npx supabase start

# Ver status dos serviços
npx supabase status

# Parar serviços
npx supabase stop
```

**Requisitos para Supabase Local:**
- Docker Desktop instalado e rodando
- Pelo menos 4GB de RAM disponível

---

## 📝 Scripts NPM Disponíveis

O projeto já inclui scripts úteis no `package.json`:

```bash
# Iniciar Supabase local
npm run supabase:start

# Parar Supabase local
npm run supabase:stop

# Ver status dos serviços
npm run supabase:status

# Resetar banco de dados local
npm run supabase:db:reset

# Criar nova migration
npm run supabase:migration:new nome_da_migration

# Servir Edge Functions localmente
npm run supabase:functions:serve
```

---

## 🗄️ Trabalhando com Migrations

### Aplicar Migrations Existentes

O projeto já possui várias migrations na pasta `supabase/migrations/`. Para aplicá-las:

**No projeto remoto:**
```bash
npx supabase db push
```

**No projeto local:**
```bash
npx supabase migration up
```

### Criar Nova Migration

```bash
npm run supabase:migration:new nome_da_migration
```

Isso criará um arquivo em `supabase/migrations/` com timestamp.

---

## 🔌 Edge Functions

### Servir Functions Localmente

```bash
npm run supabase:functions:serve
```

### Deploy de uma Function

```bash
npx supabase functions deploy nome_da_function
```

### Deploy de Todas as Functions

```bash
npx supabase functions deploy
```

---

## 📚 Comandos Úteis

```bash
# Ver diferenças entre local e remoto
npx supabase db diff

# Gerar tipos TypeScript do banco
npx supabase gen types typescript --local > src/types/supabase.ts

# Ver logs do Supabase local
npx supabase logs

# Verificar status de conexão
npx supabase projects list
```

---

## ⚠️ Troubleshooting

### Erro: "supabase: command not found"

**Solução:** Use `npx supabase` ao invés de apenas `supabase`, ou instale globalmente.

### Erro: "Docker is not running"

**Solução:** Instale e inicie o Docker Desktop antes de usar `supabase start`.

### Erro: "Project not found"

**Solução:** Verifique se você está logado (`supabase login`) e se o `project-ref` está correto.

### Erro ao fazer login

**Solução:** Certifique-se de que está usando a versão mais recente do CLI:
```bash
npm install -g supabase@latest
```

---

## 🔗 Recursos Adicionais

- [Documentação Oficial do Supabase CLI](https://supabase.com/docs/reference/cli)
- [Guia de Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)

---

## ✅ Checklist de Instalação

- [ ] Instalar dependências: `npm install`
- [ ] Fazer login: `npx supabase login`
- [ ] Vincular projeto: `npx supabase link --project-ref pgdvbanwumqjmqeybqnw`
- [ ] (Opcional) Instalar Docker Desktop para desenvolvimento local
- [ ] (Opcional) Testar: `npx supabase --version`

---

**Última atualização:** 2026-01-07
