# 323 Network - Hub de Comunidade

Plataforma de networking para brasileiros nos EUA, inspirada no Skool.com.

## 🚀 Tecnologias

- **Vue.js 3** (Composition API + TypeScript)
- **Vite** - Build tool
- **Tailwind CSS** - Estilização (tema neon)
- **Vue Router** - Roteamento
- **Pinia** - State management
- **Supabase** - Backend (Auth + Database)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## 🔧 Configuração

### Supabase CLI

Para trabalhar com migrations e Edge Functions, você precisa do Supabase CLI instalado. Veja o guia completo:

📖 **[GUIA_INSTALACAO_SUPABASE_CLI.md](./GUIA_INSTALACAO_SUPABASE_CLI.md)**

**Instalação rápida:**
```bash
npm install
npx supabase login
npx supabase link --project-ref pgdvbanwumqjmqeybqnw
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Copie o arquivo `.env.local.example` e preencha com suas credenciais do Supabase.

## 📁 Estrutura do Projeto

```
src/
├── assets/          # CSS, imagens, fontes
├── components/      # Componentes Vue
│   ├── layout/     # Header, Sidebar, Footer
│   └── ui/         # Componentes reutilizáveis
├── views/          # Páginas/Views
├── router/         # Configuração de rotas
├── stores/         # Pinia stores
├── composables/    # Composables reutilizáveis
└── lib/            # Utilitários e configurações
```

## 🎨 Design System

O projeto usa um tema neon com:
- **Primary**: `#f425f4` (Neon Pink)
- **Secondary**: `#00f0ff` (Neon Cyan)
- **Dark Mode**: Padrão

## 📝 Próximos Passos

1. Configurar Supabase (criar projeto e tabelas)
2. Implementar autenticação completa
3. Converter design HTML/CSS para componentes Vue
4. Implementar feed de comunidade
5. Implementar funcionalidades principais

## 📚 Documentação

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/docs)

---

**Desenvolvido para a comunidade 323 Network**

