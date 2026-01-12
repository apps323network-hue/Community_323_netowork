/**
 * Audit Log Utility
 * Sistema de Auditoria e Logs (Fase 2)
 * 
 * Registra todas as ações administrativas para fins de auditoria.
 */

import { supabase } from '@/lib/supabase'

// Tipos de recursos que podem ser alvo de ações
export type TargetType =
    | 'user'
    | 'post'
    | 'event'
    | 'service'
    | 'report'
    | 'challenge'
    | 'banned_word'
    | 'comment'

// Ações possíveis no sistema
export type AdminAction =
    // User actions
    | 'approve_user'
    | 'reject_user'
    | 'ban_user'
    | 'unban_user'
    | 'suspend_user'
    | 'unsuspend_user'
    | 'update_user_role'
    | 'add_strike'
    // Post actions
    | 'approve_post'
    | 'hide_post'
    | 'remove_post'
    | 'mark_spam'
    | 'create_post'
    // Event actions
    | 'approve_event'
    | 'reject_event'
    | 'create_event'
    | 'delete_event'
    | 'toggle_featured'
    // Service actions
    | 'create_service'
    | 'update_service'
    | 'approve_service'
    | 'reject_service'
    | 'delete_service'
    // Banned word actions
    | 'create_banned_word'
    | 'update_banned_word'
    | 'delete_banned_word'
    // Report actions
    | 'resolve_report'
    | 'dismiss_report'
    | 'create_report'
    // Challenge actions
    | 'create_challenge'
    | 'update_challenge'
    | 'delete_challenge'
    // Common user actions
    | 'user_create_post'
    | 'user_update_post'
    | 'user_edit_post'
    | 'user_delete_post'
    | 'user_like_post'
    | 'user_unlike_post'
    | 'user_add_comment'
    | 'user_update_comment'
    | 'user_delete_comment'
    | 'user_update_profile'
    | 'user_send_connection_request'
    | 'user_accept_connection_request'

// Interface para entrada de log
export interface LogEntry {
    action: AdminAction
    targetId?: string
    targetType?: TargetType
    details?: Record<string, any>
}

// Interface do registro salvo
export interface AdminLog {
    id: string
    admin_id: string
    action: AdminAction
    target_id: string | null
    target_type: TargetType | null
    details: Record<string, any>
    ip_address: string | null
    created_at: string
}

/**
 * Obtém o IP do cliente (best effort)
 * Em ambiente de browser, não temos acesso direto ao IP.
 * Retorna null e deixa o backend/Supabase Edge Functions capturar se necessário.
 */
function getClientIP(): string | null {
    // No browser, não conseguimos obter IP diretamente
    // Isso pode ser melhorado com uma Edge Function no futuro
    return null
}

/**
 * Registra uma ação administrativa no sistema de auditoria.
 * 
 * Esta função é assíncrona e NÃO bloqueia a operação principal.
 * Erros de logging são logados no console mas não interrompem o fluxo.
 * 
 * @param adminId - ID do administrador que executou a ação
 * @param entry - Dados da ação a ser registrada
 */
export async function logAdminAction(
    adminId: string,
    entry: LogEntry
): Promise<void> {
    try {
        const { error } = await supabase
            .from('admin_logs')
            .insert({
                admin_id: adminId,
                action: entry.action,
                target_id: entry.targetId || null,
                target_type: entry.targetType || null,
                details: entry.details || {},
                ip_address: getClientIP(),
            })

        if (error) {
            console.error('[AUDIT] Erro ao registrar log:', error)
        }
    } catch (err) {
        // Não propaga erros de logging para não interromper a operação principal
        console.error('[AUDIT] Exceção ao registrar log:', err)
    }
}

/**
 * Busca logs de ações sofridas por um alvo específico (ex: user, post)
 * Útil para construir a timeline de um usuário
 * 
 * @param targetId - ID do recurso alvo
 * @param targetType - Tipo do recurso
 * @param limit - Limite de registros (default: 50)
 * @param offset - Offset para paginação (default: 0)
 */
export async function fetchLogsForTarget(
    targetId: string,
    targetType?: TargetType,
    limit: number = 50,
    offset: number = 0
): Promise<{ logs: AdminLog[]; total: number }> {
    try {
        let query = supabase
            .from('admin_logs')
            .select('*', { count: 'exact' })
            .eq('target_id', targetId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (targetType) {
            query = query.eq('target_type', targetType)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('[AUDIT] Erro ao buscar logs:', error)
            return { logs: [], total: 0 }
        }

        return {
            logs: (data || []) as AdminLog[],
            total: count || 0
        }
    } catch (err) {
        console.error('[AUDIT] Exceção ao buscar logs:', err)
        return { logs: [], total: 0 }
    }
}

/**
 * Busca logs de ações executadas por um admin específico
 * 
 * @param adminId - ID do administrador
 * @param limit - Limite de registros (default: 50)
 * @param offset - Offset para paginação (default: 0)
 */
export async function fetchLogsByAdmin(
    adminId: string,
    limit: number = 50,
    offset: number = 0
): Promise<{ logs: AdminLog[]; total: number }> {
    try {
        const { data, error, count } = await supabase
            .from('admin_logs')
            .select('*', { count: 'exact' })
            .eq('admin_id', adminId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('[AUDIT] Erro ao buscar logs por admin:', error)
            return { logs: [], total: 0 }
        }

        return {
            logs: (data || []) as AdminLog[],
            total: count || 0
        }
    } catch (err) {
        console.error('[AUDIT] Exceção ao buscar logs por admin:', err)
        return { logs: [], total: 0 }
    }
}

/**
 * Mapeamento de ações para labels legíveis em português
 */
export const actionLabels: Record<AdminAction, string> = {
    // User
    approve_user: 'Usuário Aprovado',
    reject_user: 'Usuário Rejeitado',
    ban_user: 'Usuário Banido',
    unban_user: 'Usuário Desbanido',
    update_user_role: 'Cargo Alterado',
    suspend_user: 'Usuário Suspenso',
    unsuspend_user: 'Suspensão Removida',
    add_strike: 'Strike Adicionado',
    // Post
    approve_post: 'Post Aprovado',
    hide_post: 'Post Oculto',
    remove_post: 'Post Removido',
    mark_spam: 'Post Marcado como Spam',
    create_post: 'Post Criado (Admin)',
    // Event
    approve_event: 'Evento Aprovado',
    reject_event: 'Evento Rejeitado',
    create_event: 'Evento Criado',
    delete_event: 'Evento Deletado',
    toggle_featured: 'Destaque Alterado',
    // Service
    create_service: 'Serviço Criado',
    update_service: 'Serviço Atualizado',
    approve_service: 'Serviço Aprovado',
    reject_service: 'Serviço Rejeitado',
    delete_service: 'Serviço Deletado',
    // Banned word
    create_banned_word: 'Palavra Proibida Criada',
    update_banned_word: 'Palavra Proibida Atualizada',
    delete_banned_word: 'Palavra Proibida Deletada',
    // Report
    resolve_report: 'Denúncia Resolvida',
    dismiss_report: 'Denúncia Descartada',
    create_report: 'Denúncia Criada',
    // Challenge
    create_challenge: 'Desafio Criado',
    update_challenge: 'Desafio Atualizado',
    delete_challenge: 'Desafio Deletado',
    // User actions
    user_create_post: 'Post Criado',
    user_update_post: 'Post Atualizado',
    user_edit_post: 'Post Editado',
    user_delete_post: 'Post Deletado',
    user_like_post: 'Curtida em Post',
    user_unlike_post: 'Remoção de Curtida',
    user_add_comment: 'Comentário Adicionado',
    user_update_comment: 'Comentário Atualizado',
    user_delete_comment: 'Comentário Deletado',
    user_update_profile: 'Perfil Atualizado',
    user_send_connection_request: 'Solicitação de Conexão Enviada',
    user_accept_connection_request: 'Conexão Aceita',
}
