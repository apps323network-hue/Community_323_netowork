import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import { logAdminAction } from '@/lib/auditLog'
import { useAdminBaseStore } from './base'
import { useAdminPostsStore } from './posts'
import { useAdminUsersStore } from './users'
import type { Report, ReportStats, ReportCreateInput, ReportResolveInput, ReportStatus, ReportItemType } from '@/types/admin'

export const useAdminReportsStore = defineStore('admin-reports', () => {
  const baseStore = useAdminBaseStore()
  const { loading, error } = storeToRefs(baseStore)
  const authStore = baseStore.authStore
  const checkIsAdmin = baseStore.checkIsAdmin
  const postsStore = useAdminPostsStore()
  const usersStore = useAdminUsersStore()

  const reports = ref<Report[]>([])
  const reportStats = ref<ReportStats>({
    total: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    dismissed: 0,
    byType: { post: 0, comment: 0, user: 0 },
    byReason: { spam: 0, inappropriate: 0, harassment: 0, fake_news: 0, other: 0 },
    resolvedToday: 0,
  })

  // Buscar reports com filtros
  async function fetchReports(filters?: { status?: ReportStatus; itemType?: ReportItemType; reason?: string }) {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.itemType) {
        query = query.eq('reported_item_type', filters.itemType)
      }

      if (filters?.reason) {
        query = query.eq('reason', filters.reason)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      if (!data || data.length === 0) {
        reports.value = []
        return
      }

      // Buscar informações dos reportadores e resolvedores
      const reporterIds = [...new Set(data.map((r: any) => r.reported_by).filter(Boolean))]
      const resolverIds = [...new Set(data.map((r: any) => r.resolved_by).filter(Boolean))]
      const allUserIds = [...new Set([...reporterIds, ...resolverIds])]

      let usersMap = new Map<string, any>()

      if (allUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', allUserIds)

        if (usersData) {
          usersData.forEach((user: any) => {
            usersMap.set(user.id, user)
          })
        }
      }

      // Enriquecer reports com dados dos usuários
      const enrichedReports: Report[] = data.map((report: any) => {
        const reporter = usersMap.get(report.reported_by)
        const resolver = report.resolved_by ? usersMap.get(report.resolved_by) : null

        return {
          ...report,
          reporter_name: reporter?.nome || null,
          reporter_email: reporter?.email || null,
          resolver_name: resolver?.nome || null,
        }
      })

      reports.value = enrichedReports
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching reports:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar report específico
  async function fetchReportById(id: string): Promise<Report | null> {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single()

      if (queryError) throw queryError

      if (!data) return null

      // Buscar informações dos usuários
      const reporterId = data.reported_by
      const resolverId = data.resolved_by

      const userIds = [reporterId, resolverId].filter(Boolean) as string[]

      let usersMap = new Map<string, any>()

      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', userIds)

        if (usersData) {
          usersData.forEach((user: any) => {
            usersMap.set(user.id, user)
          })
        }
      }

      // Buscar item reportado
      let reportedItem = null
      if (data.reported_item_type === 'post') {
        const { data: postData } = await supabase
          .from('posts')
          .select('*')
          .eq('id', data.reported_item_id)
          .single()
        reportedItem = postData
      } else if (data.reported_item_type === 'comment') {
        const { data: commentData } = await supabase
          .from('post_comments')
          .select('*')
          .eq('id', data.reported_item_id)
          .single()
        reportedItem = commentData
      } else if (data.reported_item_type === 'user') {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.reported_item_id)
          .single()
        reportedItem = userData
      }

      const reporter = usersMap.get(reporterId)
      const resolver = resolverId ? usersMap.get(resolverId) : null

      return {
        ...data,
        reporter_name: reporter?.nome || null,
        reporter_email: reporter?.email || null,
        resolver_name: resolver?.nome || null,
        reported_item: reportedItem,
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching report:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Criar report
  async function createReport(input: ReportCreateInput): Promise<Report> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Verificar se usuário já reportou este item
      const { data: existingReport } = await supabase
        .from('reports')
        .select('id')
        .eq('reported_by', authStore.user.id)
        .eq('reported_item_type', input.reported_item_type)
        .eq('reported_item_id', input.reported_item_id)
        .eq('status', 'pending')
        .single()

      if (existingReport) {
        throw new Error('Você já reportou este item. Aguarde a análise do administrador.')
      }

      const { data, error: insertError } = await supabase
        .from('reports')
        .insert({
          reported_by: authStore.user.id,
          reported_item_type: input.reported_item_type,
          reported_item_id: input.reported_item_id,
          reason: input.reason,
          description: input.description || null,
          status: 'pending',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'create_report',
        targetId: data.id,
        targetType: 'report',
        details: { item_type: input.reported_item_type, reason: input.reason }
      })

      // Buscar nome do reportador
      const { data: reporterProfile } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', authStore.user.id)
        .single()
      
      const reporterName = reporterProfile?.nome || 'Usuário'

      // Notificar admins sobre novo report
      import('@/lib/emails').then(({ notifyAdminsNewReport }) => {
        notifyAdminsNewReport(
          data.id,
          input.reported_item_type,
          input.reason,
          reporterName,
          input.description || undefined
        ).catch(err => {
          console.error('Failed to notify admins about new report:', err)
        })
      })

      // Recarregar lista se estiver em contexto admin
      if (await checkIsAdmin()) {
        await fetchReports()
        await fetchReportStats()
      }

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating report:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Resolver report
  async function resolveReport(id: string, input: ReportResolveInput): Promise<void> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    if (!(await checkIsAdmin())) {
      throw new Error('Apenas admins podem resolver reports')
    }

    loading.value = true
    error.value = null

    try {
      // Buscar report
      const report = await fetchReportById(id)
      if (!report) {
        throw new Error('Report não encontrado')
      }

      // Executar ação baseada no tipo
      if (input.action === 'remove_content') {
        if (report.reported_item_type === 'post') {
          await postsStore.removePost(report.reported_item_id, input.details || 'Removido por report', input.add_strike || false)
        } else if (report.reported_item_type === 'comment') {
          // Marcar comentário como removido (soft-delete)
          const { error: updateError } = await supabase
            .from('post_comments')
            .update({
              status: 'removed',
              moderated_at: new Date().toISOString(),
              moderated_by: authStore.user.id,
              rejection_reason: input.details || 'Removido por report'
            })
            .eq('id', report.reported_item_id)

          if (updateError) throw updateError

          if (input.add_strike && report.reported_item) {
            const commentUserId = (report.reported_item as any).user_id
            if (commentUserId) {
              await postsStore.addStrikeToUser(commentUserId, input.details || 'Comentário removido por report')
            }
          }
        }
      } else if (input.action === 'suspend_user') {
        const userId = report.reported_item_type === 'user'
          ? report.reported_item_id
          : (report.reported_item as any)?.user_id

        if (userId) {
          // Suspender por 7 dias por padrão
          const suspendUntil = new Date()
          suspendUntil.setDate(suspendUntil.getDate() + 7)

          await supabase
            .from('profiles')
            .update({
              status: 'suspended',
              suspended_until: suspendUntil.toISOString(),
            })
            .eq('id', userId)
        }
      } else if (input.action === 'ban_user') {
        const userId = report.reported_item_type === 'user'
          ? report.reported_item_id
          : (report.reported_item as any)?.user_id

        if (userId) {
          // Usar a função banUser para garantir rastreamento completo
          const reason = input.details || `Banido por violação reportada (Report #${id})`
          await usersStore.banUser(userId, reason)
        }
      } else if (input.action === 'add_strike') {
        const userId = report.reported_item_type === 'user'
          ? report.reported_item_id
          : (report.reported_item as any)?.user_id

        if (userId) {
          await postsStore.addStrikeToUser(userId, input.details || 'Strike adicionado por report')
        }
      }

      // Atualizar status do report
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          resolved_by: authStore.user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Recarregar lista e estatísticas
      await fetchReports()
      await fetchReportStats()

      // Se foi removido conteúdo, emitir evento para atualizar feed
      if (input.action === 'remove_content') {
        // Disparar evento customizado para atualizar o feed
        window.dispatchEvent(new CustomEvent('post-removed', {
          detail: {
            itemId: report.reported_item_id,
            itemType: report.reported_item_type
          }
        }))
      }

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'resolve_report',
        targetId: id,
        targetType: 'report',
        details: {
          action: input.action,
          reportedItemType: report.reported_item_type,
          reportedItemId: report.reported_item_id,
          conteudo: (report.reported_item as any)?.conteudo || (report.reported_item as any)?.titulo
        }
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error resolving report:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Descartar report
  async function dismissReport(id: string, _reason?: string): Promise<void> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    if (!(await checkIsAdmin())) {
      throw new Error('Apenas admins podem descartar reports')
    }

    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          status: 'dismissed',
          resolved_by: authStore.user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Recarregar lista e estatísticas
      await fetchReports()
      await fetchReportStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'dismiss_report',
        targetId: id,
        targetType: 'report'
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error dismissing report:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar estatísticas de reports
  async function fetchReportStats() {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('reports')
        .select('*')

      if (queryError) throw queryError

      const stats: ReportStats = {
        total: data?.length || 0,
        pending: 0,
        reviewed: 0,
        resolved: 0,
        dismissed: 0,
        byType: { post: 0, comment: 0, user: 0 },
        byReason: { spam: 0, inappropriate: 0, harassment: 0, fake_news: 0, other: 0 },
        resolvedToday: 0,
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      data?.forEach((report: any) => {
        // Por status
        if (report.status === 'pending') stats.pending++
        else if (report.status === 'reviewed') stats.reviewed++
        else if (report.status === 'resolved') {
          stats.resolved++
          // Resolvidos hoje
          if (report.resolved_at) {
            const resolvedDate = new Date(report.resolved_at)
            if (resolvedDate >= today) {
              stats.resolvedToday++
            }
          }
        }
        else if (report.status === 'dismissed') stats.dismissed++

        // Por tipo
        if (report.reported_item_type === 'post') stats.byType.post++
        else if (report.reported_item_type === 'comment') stats.byType.comment++
        else if (report.reported_item_type === 'user') stats.byType.user++

        // Por motivo
        if (report.reason === 'spam') stats.byReason.spam++
        else if (report.reason === 'inappropriate') stats.byReason.inappropriate++
        else if (report.reason === 'harassment') stats.byReason.harassment++
        else if (report.reason === 'fake_news') stats.byReason.fake_news++
        else if (report.reason === 'other') stats.byReason.other++
      })

      reportStats.value = stats
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching report stats:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    reports,
    reportStats,
    fetchReports,
    fetchReportById,
    createReport,
    resolveReport,
    dismissReport,
    fetchReportStats,
  }
})

