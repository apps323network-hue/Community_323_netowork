import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import { logAdminAction } from '@/lib/auditLog'
import { useAdminBaseStore } from './base'
import type { AdminService, ServiceStats } from '@/types/admin'

export const useAdminServicesStore = defineStore('admin-services', () => {
  const baseStore = useAdminBaseStore()
  const { loading, error } = storeToRefs(baseStore)
  const authStore = baseStore.authStore

  const allServices = ref<AdminService[]>([])
  const serviceStats = ref<ServiceStats>({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0,
  })

  // Buscar todos os serviços
  async function fetchAllServices() {
    loading.value = true
    error.value = null

    try {
      const { data: servicesData, error: queryError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      if (!servicesData || servicesData.length === 0) {
        allServices.value = []
        return
      }

      // Buscar nomes dos parceiros se houver
      const partnerIds = [...new Set(servicesData.map((s: any) => s.parceiro_id).filter(Boolean))]
      let partnersMap = new Map<string, any>()

      if (partnerIds.length > 0) {
        const { data: partnersData } = await supabase
          .from('partners')
          .select('id, nome')
          .in('id', partnerIds)

        partnersData?.forEach((partner: any) => {
          partnersMap.set(partner.id, partner)
        })
      }

      // Combinar serviços com nomes dos parceiros
      allServices.value = servicesData.map((service: any) => {
        const partner = service.parceiro_id ? partnersMap.get(service.parceiro_id) : null
        return {
          ...service,
          partner_name: partner?.nome,
        } as AdminService
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching services:', err)
    } finally {
      loading.value = false
    }
  }

  // Criar serviço
  async function createService(serviceData: Partial<AdminService>) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Clean up empty strings and convert to null
      const cleanData: any = {
        nome: serviceData.nome,
        descricao: serviceData.descricao && serviceData.descricao.trim() ? serviceData.descricao : null,
        parceiro_id: serviceData.parceiro_id && serviceData.parceiro_id.trim() ? serviceData.parceiro_id : null,
        categoria: serviceData.categoria && serviceData.categoria.trim() ? serviceData.categoria : null,
        beneficio_membro: serviceData.beneficio_membro && serviceData.beneficio_membro.trim() ? serviceData.beneficio_membro : null,
        destaque: serviceData.destaque || false,
        ativo: serviceData.ativo !== undefined ? serviceData.ativo : true,
        preco: serviceData.preco && serviceData.preco > 0 ? serviceData.preco : null,
        moeda: serviceData.moeda && (serviceData.moeda === 'USD' || serviceData.moeda === 'BRL') ? serviceData.moeda : 'USD',
      }

      const { data, error: insertError } = await supabase
        .from('services')
        .insert(cleanData)
        .select()
        .single()

      if (insertError) {
        console.error('[ADMIN] Erro ao criar serviço:', insertError)
        throw insertError
      }

      // Atualizar lista
      await fetchAllServices()
      await fetchServiceStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'create_service',
        targetId: data.id,
        targetType: 'service',
        details: { nome: data.nome, categoria: data.categoria }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating service:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Atualizar serviço
  async function updateService(serviceId: string, updates: Partial<AdminService>) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Clean up empty strings and convert to null
      const cleanData: any = {
        updated_at: new Date().toISOString(),
      }

      if (updates.nome !== undefined) cleanData.nome = updates.nome
      if (updates.descricao !== undefined) {
        cleanData.descricao = updates.descricao && updates.descricao.trim() ? updates.descricao : null
      }
      if (updates.parceiro_id !== undefined) {
        cleanData.parceiro_id = updates.parceiro_id && updates.parceiro_id.trim() ? updates.parceiro_id : null
      }
      if (updates.categoria !== undefined) {
        cleanData.categoria = updates.categoria && updates.categoria.trim() ? updates.categoria : null
      }
      if (updates.beneficio_membro !== undefined) {
        cleanData.beneficio_membro = updates.beneficio_membro && updates.beneficio_membro.trim() ? updates.beneficio_membro : null
      }
      if (updates.destaque !== undefined) cleanData.destaque = updates.destaque
      if (updates.ativo !== undefined) cleanData.ativo = updates.ativo
      if (updates.preco !== undefined) {
        cleanData.preco = updates.preco && updates.preco > 0 ? updates.preco : null
      }
      if (updates.moeda !== undefined) {
        cleanData.moeda = updates.moeda && (updates.moeda === 'USD' || updates.moeda === 'BRL') ? updates.moeda : 'USD'
      }

      const { data, error: updateError } = await supabase
        .from('services')
        .update(cleanData)
        .eq('id', serviceId)
        .select()
        .single()

      if (updateError) {
        console.error('[ADMIN] Erro ao atualizar serviço:', updateError)
        throw updateError
      }

      // Atualizar lista
      await fetchAllServices()
      await fetchServiceStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'update_service',
        targetId: serviceId,
        targetType: 'service',
        details: { updates: Object.keys(cleanData) }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating service:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Deletar serviço
  async function deleteService(serviceId: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (deleteError) throw deleteError

      // Atualizar lista
      await fetchAllServices()
      await fetchServiceStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'delete_service',
        targetId: serviceId,
        targetType: 'service'
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting service:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar estatísticas de serviços
  async function fetchServiceStats() {
    try {
      const { data, error: queryError } = await supabase
        .from('services')
        .select('ativo, destaque')

      if (queryError) throw queryError

      const total = data?.length || 0
      const active = data?.filter(s => s.ativo).length || 0
      const inactive = data?.filter(s => !s.ativo).length || 0
      const featured = data?.filter(s => s.destaque).length || 0

      serviceStats.value = {
        total,
        active,
        inactive,
        featured,
      }
    } catch (err: any) {
      console.error('Error fetching service stats:', err)
    }
  }

  return {
    allServices,
    serviceStats,
    fetchAllServices,
    createService,
    updateService,
    deleteService,
    fetchServiceStats,
  }
})

