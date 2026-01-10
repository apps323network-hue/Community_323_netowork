# 🔍 Diagnóstico de Problemas de Conexão com o Banco de Dados

**Data**: 2026-01-07  
**Projeto**: 323 Network Community

---

## ❌ Problema Identificado

Você não consegue conectar ou trabalhar com o banco de dados relacionado ao projeto.

### Erro Principal

```
failed to parse connection string: cannot parse `postgresql://:xxxxx@:0/?connect_timeout=10`: invalid port (outside range)
```

Este erro indica que a **string de conexão do banco de dados remoto não está configurada corretamente** no Supabase CLI.

---

## 🔎 Análise do Problema

### ✅ O que está funcionando:

1. **Supabase CLI instalado**: Versão 1.226.4 (há uma versão mais nova disponível: v2.67.1)
2. **Projeto vinculado**: O projeto está vinculado ao Supabase remoto (`pgdvbanwumqjmqeybqnw`)
3. **Variáveis de ambiente**: Arquivo `.env` existe com as chaves de API configuradas
4. **Configuração local**: Arquivo `supabase/config.toml` existe para desenvolvimento local

### ❌ O que está faltando:

1. **Arquivo `.supabase/config.toml`**: Não existe - este arquivo contém a string de conexão do banco remoto
2. **Senha do banco de dados**: Necessária para criar a string de conexão
3. **String de conexão completa**: O CLI precisa da connection string para operações remotas

---

## 🔧 Soluções

### **Solução 1: Re-vincular o Projeto com Senha do Banco (Recomendado)**

Para trabalhar com o banco remoto, você precisa da **senha do banco de dados PostgreSQL** do projeto Supabase.

#### Passo 1: Obter a Senha do Banco

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione o projeto: **323 network community** (`pgdvbanwumqjmqeybqnw`)
3. Vá em **Settings** > **Database**
4. Role até a seção **Connection string**
5. Copie a **Database password** (ou redefina se necessário)

#### Passo 2: Re-vincular o Projeto

Execute o comando abaixo substituindo `SUA_SENHA_DO_BANCO` pela senha obtida:

```powershell
cd "c:\Users\Henrique-PC\Downloads\323 networking\Community_323_network"
npx supabase link --project-ref pgdvbanwumqjmqeybqnw --password SUA_SENHA_DO_BANCO
```

Isso criará o arquivo `.supabase/config.toml` com a string de conexão correta.

#### Passo 3: Verificar Conexão

```powershell
# Testar conexão
npx supabase db pull

# Ver status
npx supabase status
```

---

### **Solução 2: Usar Connection String Diretamente**

Se você tem a connection string completa do banco:

1. Crie o diretório `.supabase` (se não existir)
2. Crie o arquivo `.supabase/config.toml` com:

```toml
[db]
# Connection string do banco remoto
# Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
connection_string = "postgresql://postgres:SUA_SENHA@db.pgdvbanwumqjmqeybqnw.supabase.co:5432/postgres"
```

**⚠️ IMPORTANTE**: Substitua `SUA_SENHA` pela senha real do banco.

---

### **Solução 3: Atualizar Supabase CLI**

A versão atual (1.226.4) está desatualizada. A versão mais recente (v2.67.1) pode ter melhorias na conexão:

```powershell
# Atualizar via npm
npm install -g supabase@latest

# Ou usar npx sempre (recomendado)
npx supabase@latest --version
```

---

## 📋 Checklist de Resolução

- [ ] Obter senha do banco de dados no Dashboard do Supabase
- [ ] Re-vincular projeto com `npx supabase link --project-ref pgdvbanwumqjmqeybqnw --password [SENHA]`
- [ ] Verificar se arquivo `.supabase/config.toml` foi criado
- [ ] Testar conexão com `npx supabase db pull`
- [ ] (Opcional) Atualizar Supabase CLI para versão mais recente

---

## 🔗 Informações do Projeto

- **Project ID (ref)**: `pgdvbanwumqjmqeybqnw`
- **Project URL**: `https://pgdvbanwumqjmqeybqnw.supabase.co`
- **Database Host**: `db.pgdvbanwumqjmqeybqnw.supabase.co`
- **Database Version**: `17.6.1.063`
- **Postgres Engine**: `17`

---

## 📚 Comandos Úteis Após Resolver

Após configurar a conexão, você poderá usar:

```powershell
# Ver diferenças entre local e remoto
npx supabase db diff

# Aplicar migrations remotas
npx supabase db push

# Baixar schema remoto
npx supabase db pull

# Gerar tipos TypeScript
npx supabase gen types typescript --project-id pgdvbanwumqjmqeybqnw > src/types/supabase.ts

# Ver logs do banco
npx supabase db logs
```

---

## ⚠️ Notas Importantes

1. **Senha do Banco**: A senha do banco é diferente da Service Role Key
2. **Arquivo `.supabase/config.toml`**: Este arquivo contém credenciais sensíveis e deve estar no `.gitignore`
3. **Segurança**: Nunca commite a senha do banco ou a connection string no repositório
4. **Ambiente Local vs Remoto**: 
   - `supabase/config.toml` = configuração para desenvolvimento local
   - `.supabase/config.toml` = configuração para conexão remota

---

## 🆘 Se o Problema Persistir

1. Verifique se você tem permissões de administrador no projeto Supabase
2. Confirme que o projeto está ativo e saudável no Dashboard
3. Tente fazer logout e login novamente: `npx supabase logout` e depois `npx supabase login`
4. Verifique se há firewall ou proxy bloqueando a conexão
5. Use `--debug` para ver logs detalhados: `npx supabase db pull --debug`

---

**Última atualização**: 2026-01-07
