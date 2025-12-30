import { computed } from 'vue'
import { usePostStore } from '@/stores/posts'
import type { PostFilters, PostCreateInput, CommentCreateInput } from '@/types/posts'

export function usePosts() {
  const postStore = usePostStore()

  // Computed
  const posts = computed(() => postStore.posts)
  const loading = computed(() => postStore.loading)
  const error = computed(() => postStore.error)
  const hasMore = computed(() => postStore.hasMore)

  // Actions
  async function loadPosts(filters: PostFilters = {}, reset = true) {
    return await postStore.fetchPosts(filters, reset)
  }

  async function loadMorePosts(filters: PostFilters = {}) {
    return await postStore.fetchPosts(filters, false)
  }

  async function getPostById(postId: string) {
    return await postStore.fetchPostById(postId)
  }

  async function createPost(input: PostCreateInput) {
    return await postStore.createPost(input)
  }

  async function updatePost(postId: string, updates: Partial<PostCreateInput>) {
    return await postStore.updatePost(postId, updates)
  }

  async function deletePost(postId: string) {
    return await postStore.deletePost(postId)
  }

  async function toggleLike(postId: string) {
    return await postStore.toggleLike(postId)
  }

  async function loadComments(postId: string) {
    return await postStore.fetchComments(postId)
  }

  async function addComment(input: CommentCreateInput) {
    return await postStore.addComment(input)
  }


  async function removeComment(commentId: string) {
    return await postStore.deleteComment(commentId)
  }

  function reset() {
    postStore.reset()
  }

  return {
    // State
    posts,
    loading,
    error,
    hasMore,
    // Actions
    loadPosts,
    loadMorePosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    loadComments,
    addComment,
    removeComment,
    reset,
  }
}

