# 🔐 SSO MatrículaUSA - Página de Callback Pendente

**Data**: 2026-01-02  
**Status**: ⚠️ **AÇÃO NECESSÁRIA**  
**Prioridade**: 🔴 **ALTA**

---

## 📋 Situação Atual

A integração SSO entre **323 Network** e **MatrículaUSA** está **95% completa**:

✅ **323 Network (Concluído)**:
- Edge Function `validate-user-for-external` deployada e funcionando
- Frontend configurado para redirecionar com token JWT
- Serviço "MatrículaUSA" cadastrado na plataforma

✅ **MatrículaUSA - Backend (Concluído)**:
- Edge Function `sso-323-network-callback` deployada e funcionando
- Validação de token implementada
- Criação/busca de usuário implementada
- Geração de sessão implementada

❌ **MatrículaUSA - Frontend (Pendente)**:
- **Falta criar a página/rota `/auth/callback`** que recebe o token e processa o SSO

---

## 🔍 Problema Identificado

Quando um usuário do 323 Network clica em "Acessar Serviço" no MatrículaUSA, ele é redirecionado para:

```
http://192.168.101.3:5173/auth/callback?token={jwt_token}&source=323-network
```

**Resultado atual**: Página "Page not found" (404)  
**Causa**: A rota `/auth/callback` não existe no frontend do MatrículaUSA

---

## ✅ Solução: Criar Página de Callback

### **Passo 1: Criar Componente Vue**

Criar arquivo: `src/views/AuthCallback323Network.vue` (ou similar)

```vue
<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="text-gray-600 dark:text-gray-400 text-lg">{{ message }}</p>
      </div>
      <div v-else-if="error" class="space-y-4">
        <div class="text-red-500 text-4xl mb-4">⚠️</div>
        <p class="text-red-600 dark:text-red-400 text-lg font-semibold">{{ error }}</p>
        <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">Redirecionando para login...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase' // Ajustar import conforme sua estrutura
import { toast } from 'vue-sonner' // ou sua biblioteca de notificações

const route = useRoute()
const router = useRouter()
const { supabase } = useSupabase()

const loading = ref(true)
const message = ref('Validando autenticação...')
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // 1. Obter token da query string
    const token = route.query.token as string
    const source = route.query.source as string
    const returnTo = (route.query.returnTo as string) || '/dashboard'

    console.log('[SSO Callback] Iniciando processamento...')
    console.log('[SSO Callback] Source:', source)
    console.log('[SSO Callback] Token presente:', !!token)

    if (!token) {
      throw new Error('Token não fornecido na URL')
    }

    if (source !== '323-network') {
      throw new Error('Origem inválida. Esperado: 323-network')
    }

    message.value = 'Validando token com 323 Network...'

    // 2. Chamar Edge Function do MatrículaUSA
    const edgeFunctionUrl = 'https://fitpynguasqqutuhzifx.supabase.co/functions/v1/sso-323-network-callback'
    
    console.log('[SSO Callback] Chamando Edge Function...')
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    console.log('[SSO Callback] Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      console.error('[SSO Callback] Erro na resposta:', errorData)
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    console.log('[SSO Callback] Dados recebidos:', { 
      success: data.success, 
      isNewUser: data.isNewUser,
      hasSession: !!data.session 
    })

    if (!data.success) {
      throw new Error(data.error || 'Falha ao processar autenticação')
    }

    // 3. Verificar se temos tokens de sessão
    if (!data.session || !data.session.access_token) {
      // Se não temos tokens, mas temos magicLink, usar ele
      if (data.magicLink) {
        console.log('[SSO Callback] Usando magic link...')
        message.value = 'Redirecionando...'
        window.location.href = data.magicLink
        return
      }
      throw new Error('Sessão não retornada pela Edge Function')
    }

    message.value = 'Criando sessão...'

    // 4. Criar sessão no Supabase
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    if (sessionError) {
      console.error('[SSO Callback] Erro ao criar sessão:', sessionError)
      throw new Error(`Erro ao criar sessão: ${sessionError.message}`)
    }

    console.log('[SSO Callback] ✅ Sessão criada com sucesso!')
    console.log('[SSO Callback] Usuário:', data.user?.email)
    console.log('[SSO Callback] Novo usuário?', data.isNewUser)

    // 5. Mostrar mensagem de sucesso
    if (data.isNewUser) {
      toast.success('Bem-vindo ao MatrículaUSA! Sua conta foi criada automaticamente.')
    } else {
      toast.success('Login realizado com sucesso!')
    }

    message.value = 'Redirecionando...'

    // 6. Redirecionar para página desejada
    await new Promise(resolve => setTimeout(resolve, 500)) // Pequeno delay para UX

    if (returnTo.startsWith('http')) {
      // URL externa - redirecionar diretamente
      window.location.href = returnTo
    } else {
      // Rota interna - usar router
      router.push(returnTo)
    }
  } catch (err: any) {
    console.error('[SSO Callback] ❌ Erro:', err)
    loading.value = false
    error.value = err.message || 'Erro ao processar autenticação SSO'
    
    toast.error(error.value)
    
    // Redirecionar para login após 3 segundos
    setTimeout(() => {
      router.push({ name: 'Login', query: { error: 'sso_failed' } })
    }, 3000)
  }
})
</script>
```

### **Passo 2: Adicionar Rota no Router**

No arquivo de rotas (ex: `src/router/index.ts` ou `src/router/routes.ts`):

```typescript
{
  path: '/auth/callback',
  name: 'AuthCallback323Network',
  component: () => import('@/views/AuthCallback323Network.vue'),
  meta: { 
    requiresAuth: false, // Não requer autenticação (estamos autenticando agora)
    title: 'Processando Login...'
  }
}
```

**OU** se preferir uma rota mais específica:

```typescript
{
  path: '/auth/323-network/callback',
  name: 'AuthCallback323Network',
  component: () => import('@/views/AuthCallback323Network.vue'),
  meta: { 
    requiresAuth: false,
    title: 'Processando Login...'
  }
}
```

**⚠️ IMPORTANTE**: Se usar `/auth/323-network/callback`, atualize o `sso_callback_path` no banco de dados do 323 Network para `/auth/323-network/callback`.

---

## 🔄 Fluxo Completo Após Implementação

```
1. Usuário no 323 Network (logado)
   ↓
2. Clica em "Acessar Serviço" → MatrículaUSA
   ↓
3. 323 Network redireciona para:
   http://192.168.101.3:5173/auth/callback?token={jwt}&source=323-network
   ↓
4. MatrículaUSA: Página /auth/callback recebe token
   ↓
5. Frontend chama Edge Function:
   POST /functions/v1/sso-323-network-callback { token }
   ↓
6. Edge Function:
   - Valida token com 323 Network
   - Cria/busca usuário
   - Gera sessão
   - Retorna tokens
   ↓
7. Frontend cria sessão:
   supabase.auth.setSession({ access_token, refresh_token })
   ↓
8. Redireciona para /dashboard
   ↓
9. ✅ Usuário logado no MatrículaUSA
```

---

## 🧪 Como Testar

### **Teste 1: Fluxo Completo**

1. Acesse o 323 Network e faça login
2. Vá para página de Serviços
3. Clique em "Acessar Serviço" no MatrículaUSA
4. Deve redirecionar para `/auth/callback` do MatrículaUSA
5. Deve processar o token automaticamente
6. Deve criar sessão e redirecionar para dashboard
7. Deve estar logado no MatrículaUSA

### **Teste 2: Verificar Logs**

Abra o Console do navegador (F12) e verifique os logs:
- `[SSO Callback] Iniciando processamento...`
- `[SSO Callback] Chamando Edge Function...`
- `[SSO Callback] ✅ Sessão criada com sucesso!`

### **Teste 3: Verificar Sessão**

Após o redirecionamento, verifique se a sessão foi criada:
```javascript
// No console do navegador
const { data: { session } } = await supabase.auth.getSession()
console.log('Sessão:', session?.user?.email)
```

---

## ⚠️ Tratamento de Erros

A implementação acima já trata os seguintes casos:

- ✅ Token ausente na URL
- ✅ Source inválido
- ✅ Erro na Edge Function
- ✅ Sessão não retornada
- ✅ Erro ao criar sessão
- ✅ Redirecionamento para login em caso de erro

---

## 📝 Checklist de Implementação

- [ ] Criar componente `AuthCallback323Network.vue`
- [ ] Adicionar rota `/auth/callback` no router
- [ ] Testar fluxo completo end-to-end
- [ ] Verificar criação de sessão
- [ ] Verificar redirecionamento para dashboard
- [ ] Testar com usuário novo
- [ ] Testar com usuário existente
- [ ] Verificar logs no console
- [ ] Testar tratamento de erros

---

## 🔗 URLs Importantes

- **Edge Function MatrículaUSA**: `https://fitpynguasqqutuhzifx.supabase.co/functions/v1/sso-323-network-callback`
- **Edge Function 323 Network**: `https://pgdvbanwumqjmqeybqnw.supabase.co/functions/v1/validate-user-for-external`
- **Documentação Completa**: Ver `SSO_EXEMPLO_IMPLEMENTACAO_MATRICULA_US.md`

---

## 📞 Suporte

Se tiver dúvidas ou problemas na implementação, entre em contato com a equipe do 323 Network.

---

## ✅ Após Implementação

Após criar a página de callback, a integração SSO estará **100% completa** e funcionando! 🎉




