import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Member, MemberFilters, MemberPagination } from '@/types/members'

export function useMembers() {
  const members = ref<Member[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<MemberPagination>({
    page: 1,
    perPage: 12,
    total: 0,
  })

  const totalPages = computed(() => 
    Math.ceil(pagination.value.total / pagination.value.perPage)
  )

  async function fetchMembers(filters: MemberFilters = {}, page = 1) {
    loading.value = true
    error.value = null

    try {
      const from = (page - 1) * pagination.value.perPage
      const to = from + pagination.value.perPage - 1

      const authStore = useAuthStore()
      const currentUserId = authStore.user?.id

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })

      // Excluir o próprio usuário logado
      if (currentUserId) {
        query = query.neq('id', currentUserId)
      }

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`nome.ilike.%${filters.search}%,area_atuacao.ilike.%${filters.search}%,cidade.ilike.%${filters.search}%`)
      }

      if (filters.area_atuacao) {
        query = query.eq('area_atuacao', filters.area_atuacao)
      }

      if (filters.cidade) {
        query = query.ilike('cidade', `%${filters.cidade}%`)
      }

      if (filters.objetivo) {
        query = query.eq('objetivo', filters.objetivo)
      }

      if (filters.plano) {
        query = query.eq('plano', filters.plano)
      }

      // Ordenar e paginar
      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError

      members.value = data || []
      pagination.value = {
        ...pagination.value,
        page,
        total: count || 0,
      }
    } catch (err: any) {
      console.error('Error fetching members:', err)
      error.value = err.message || 'Erro ao buscar membros'
    } finally {
      loading.value = false
    }
  }

  async function fetchMemberById(idOrUsername: string): Promise<Member | null> {
    loading.value = true
    error.value = null

    try {
      // Check if it's a valid UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername)
      
      let query = supabase
        .from('profiles')
        .select('*')
      
      if (isUUID) {
        // If it's a UUID, search by id
        query = query.eq('id', idOrUsername)
        const { data, error: queryError } = await query.single()
        if (queryError) throw queryError
        return data
      } else {
        // If it's not a UUID, search by nome (username) - exact match (case-insensitive)
        // Use ilike for case-insensitive search, but we need exact match
        const { data: dataList, error: listError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('nome', idOrUsername)
        
        if (listError) throw listError
        
        if (!dataList || dataList.length === 0) {
          return null // User not found
        }
        
        // Find exact match (case-insensitive)
        const exactMatch = dataList.find(profile => 
          profile.nome && profile.nome.toLowerCase() === idOrUsername.toLowerCase()
        )
        
        return exactMatch || dataList[0] // Return exact match or first result
      }
    } catch (err: any) {
      console.error('Error fetching member:', err)
      error.value = err.message || 'Erro ao buscar membro'
      return null
    } finally {
      loading.value = false
    }
  }

  async function searchMembers(query: string) {
    return fetchMembers({ search: query })
  }

  function setPage(page: number) {
    pagination.value.page = page
  }

  function setPerPage(perPage: number) {
    pagination.value.perPage = perPage
  }

  return {
    members,
    loading,
    error,
    pagination,
    totalPages,
    fetchMembers,
    fetchMemberById,
    searchMembers,
    setPage,
    setPerPage,
  }
}
