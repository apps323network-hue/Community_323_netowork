import { defineStore } from 'pinia'
import { storeToRefs } from 'pinia'
import { useAdminBaseStore } from './base'
import { useAdminEventsStore } from './events'
import { useAdminUsersStore } from './users'
import { useAdminPostsStore } from './posts'
import { useAdminServicesStore } from './services'
import { useAdminBannedWordsStore } from './bannedWords'
import { useAdminReportsStore } from './reports'
import { useAdminChallengesStore } from './challenges'

/**
 * Store principal de admin que re-exporta todos os stores específicos
 * Mantém compatibilidade total com o código existente
 */
export const useAdminStore = defineStore('admin', () => {
  const baseStore = useAdminBaseStore()
  const eventsStore = useAdminEventsStore()
  const usersStore = useAdminUsersStore()
  const postsStore = useAdminPostsStore()
  const servicesStore = useAdminServicesStore()
  const bannedWordsStore = useAdminBannedWordsStore()
  const reportsStore = useAdminReportsStore()
  const challengesStore = useAdminChallengesStore()

  // Re-exportar estados compartilhados usando storeToRefs para preservar reatividade
  const { loading, error } = storeToRefs(baseStore)

  // Re-exportar refs dos stores específicos usando storeToRefs para preservar reatividade
  const { pendingEvents, allEvents, stats: eventStats } = storeToRefs(eventsStore)
  const { pendingUsers, allUsers, userStats } = storeToRefs(usersStore)
  const { pendingPosts, allPosts, postStats } = storeToRefs(postsStore)
  const { allServices, serviceStats } = storeToRefs(servicesStore)
  const { bannedWords, bannedWordStats } = storeToRefs(bannedWordsStore)
  const { reports, reportStats } = storeToRefs(reportsStore)
  const { challenges, challengeStats } = storeToRefs(challengesStore)

  // Re-exportar função compartilhada
  const checkIsAdmin = baseStore.checkIsAdmin

  // Re-exportar todos os estados e funções de cada store específico
  return {
    // Estados compartilhados
    loading,
    error,

    // Funções compartilhadas
    checkIsAdmin,

    // Events
    pendingEvents,
    allEvents,
    stats: eventStats,
    fetchPendingEvents: eventsStore.fetchPendingEvents,
    fetchAllEvents: eventsStore.fetchAllEvents,
    createEvent: eventsStore.createEvent,
    toggleEventDestaque: eventsStore.toggleEventDestaque,
    approveEvent: eventsStore.approveEvent,
    rejectEvent: eventsStore.rejectEvent,
    deleteEvent: eventsStore.deleteEvent,
    fetchEventStats: eventsStore.fetchEventStats,
    handleEventApproval: eventsStore.handleEventApproval,

    // Users
    pendingUsers,
    allUsers,
    userStats,
    fetchPendingUsers: usersStore.fetchPendingUsers,
    fetchAllUsers: usersStore.fetchAllUsers,
    approveUser: usersStore.approveUser,
    rejectUser: usersStore.rejectUser,
    banUser: usersStore.banUser,
    unbanUser: usersStore.unbanUser,
    updateUserRole: usersStore.updateUserRole,
    fetchUserStats: usersStore.fetchUserStats,

    // Posts
    pendingPosts,
    allPosts,
    postStats,
    fetchPendingPosts: postsStore.fetchPendingPosts,
    fetchAllPosts: postsStore.fetchAllPosts,
    createPost: postsStore.createPost,
    approvePost: postsStore.approvePost,
    hidePost: postsStore.hidePost,
    removePost: postsStore.removePost,
    markAsSpam: postsStore.markAsSpam,
    fetchPostStats: postsStore.fetchPostStats,
    addStrikeToUser: postsStore.addStrikeToUser,

    // Services
    allServices,
    serviceStats,
    fetchAllServices: servicesStore.fetchAllServices,
    createService: servicesStore.createService,
    updateService: servicesStore.updateService,
    approveService: servicesStore.approveService,
    rejectService: servicesStore.rejectService,
    deleteService: servicesStore.deleteService,
    fetchServiceStats: servicesStore.fetchServiceStats,

    // Banned Words
    bannedWords,
    bannedWordStats,
    fetchBannedWords: bannedWordsStore.fetchBannedWords,
    createBannedWord: bannedWordsStore.createBannedWord,
    updateBannedWord: bannedWordsStore.updateBannedWord,
    deleteBannedWord: bannedWordsStore.deleteBannedWord,

    // Reports
    reports,
    reportStats,
    fetchReports: reportsStore.fetchReports,
    fetchReportById: reportsStore.fetchReportById,
    createReport: reportsStore.createReport,
    resolveReport: reportsStore.resolveReport,
    dismissReport: reportsStore.dismissReport,
    fetchReportStats: reportsStore.fetchReportStats,

    // Challenges
    challenges,
    challengeStats,
    fetchChallenges: challengesStore.fetchChallenges,
    createChallenge: challengesStore.createChallenge,
    updateChallenge: challengesStore.updateChallenge,
    deleteChallenge: challengesStore.deleteChallenge,
    fetchChallengeStats: challengesStore.fetchChallengeStats,
  }
})

