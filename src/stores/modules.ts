// Pinia store for managing program modules and lessons
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import type { ProgramModule, ProgramLesson, ProgramMaterial, YouTubeVideoDetails } from '@/types/modules'

interface ModulesState {
    modules: ProgramModule[]
    currentModule: ProgramModule | null
    lessons: ProgramLesson[]
    currentLesson: ProgramLesson | null
    materials: ProgramMaterial[]
    loading: boolean
    error: string | null
}

export const useModulesStore = defineStore('modules', {
    state: (): ModulesState =& gt; ({
        modules: [],
        currentModule: null,
        lessons: [],
        currentLesson: null,
        materials: [],
        loading: false,
        error: null
    }),

        getters: {
    getModulesByProgram: (state) => (programId: string) => {
        return state.modules
            .filter(m => m.program_id === programId)
            .sort((a, b) => a.order_index - b.order_index)
    },

        getLessonsByModule: (state) => (moduleId: string) => {
            return state.lessons
                .filter(l => l.module_id === moduleId)
                .sort((a, b) => a.order_index - b.order_index)
        },

            getMaterialsByLesson: (state) => (lessonId: string) => {
                return state.materials
                    .filter(m => m.lesson_id === lessonId)
                    .sort((a, b) => a.order_index - b.order_index)
            },

                getMaterialsByModule: (state) => (moduleId: string) => {
                    return state.materials
                        .filter(m => m.module_id === moduleId && !m.lesson_id)
                        .sort((a, b) => a.order_index - b.order_index)
                }
},

actions: {
    // ============================================
    // MODULES ACTIONS
    // ============================================
    
    async fetchModulesWithLessons(programId: string) {
        this.loading = true
        this.error = null

        try {
            const { data: modules, error } = await supabase
                .from('program_modules')
                .select(`
            *,
            lessons:program_lessons(*)
          `)
                .eq('program_id', programId)
                .order('order_index', { ascending: true })

            if (error) throw error

            this.modules = modules || []

            // Flatten lessons for easy access
            this.lessons = modules?.flatMap(m => m.lessons || []) || []

            return modules
        } catch (err: any) {
            this.error = err.message
            console.error('Error fetching modules:', err)
            return []
        } finally {
            this.loading = false
        }
    },

    async createModule(moduleData: Partial<ProgramModule>) {
        this.loading = true
        this.error = null

        try {
            const { data, error } = await supabase
                .from('program_modules')
                .insert([moduleData])
                .select()
                .single()

            if (error) throw error

            this.modules.push(data)
            return data
        } catch (err: any) {
            this.error = err.message
            console.error('Error creating module:', err)
            throw err
        } finally {
            this.loading = false
        }
    },

    async updateModule(moduleId: string, updates: Partial<ProgramModule>) {
        this.loading = true
        this.error = null

        try {
            const { data, error } = await supabase
                .from('program_modules')
                .update(updates)
                .eq('id', moduleId)
                .select()
                .single()

            if (error) throw error

            const index = this.modules.findIndex(m => m.id === moduleId)
            if (index !== -1) {
                this.modules[index] = data
            }

            return data
        } catch (err: any) {
            this.error = err.message
            console.error('Error updating module:', err)
            throw err
        } finally {
            this.loading = false
        }
    },

    async deleteModule(moduleId: string) {
        this.loading = true
        this.error = null

        try {
            const { error } = await supabase
                .from('program_modules')
                .delete()
                .eq('id', moduleId)

            if (error) throw error

            this.modules = this.modules.filter(m => m.id !== moduleId)
            this.lessons = this.lessons.filter(l => l.module_id !== moduleId)
        } catch (err: any) {
            this.error = err.message
            console.error('Error deleting module:', err)
            throw err
        } finally {
            this.loading = false
        }
    },

    // ============================================
    // LESSONS ACTIONS
    // ============================================

    async fetchLesson(lessonId: string) {
        this.loading = true
        this.error = null

        try {
            const { data, error } = await supabase
                .from('program_lessons')
                .select('*')
                .eq('id', lessonId)
                .single()

            if (error) throw error

            this.currentLesson = data
            return data
        } catch (err: any) {
            this.error = err.message
            console.error('Error fetching lesson:', err)
            return null
        } finally {
            this.loading = false
        }
    },

    async createLesson(lessonData: Partial<ProgramLesson>, fetchYouTubeData = true) {
        this.loading = true
        this.error = null

        try {
            let finalLessonData = { ...lessonData }

            // Fetch YouTube video details if enabled
            if (fetchYouTubeData && lessonData.youtube_video_id) {
                const youtubeDetails = await this.getYouTubeVideoDetails(lessonData.youtube_video_id)

                if (youtubeDetails) {
                    finalLessonData = {
                        ...finalLessonData,
                        youtube_thumbnail_url: youtubeDetails.thumbnail_url,
                        duration_seconds: youtubeDetails.duration_seconds
                    }
                }
            }

            const { data, error } = await supabase
                .from('program_lessons')
                .insert([finalLessonData])
                .select()
                .single()

            if (error) throw error

            this.lessons.push(data)
            return data
        } catch (err: any) {
            this.error = err.message
            console.error('Error creating lesson:', err)
            throw err
        } finally {
            this.loading = false
        }
    },

    async updateLesson(lessonId: string, updates: Partial<ProgramLesson>, fetchYouTubeData = false) {
        this.loading = true
        this.error = null

        try {
            let finalUpdates = { ...updates }

            // Fetch YouTube details if video ID changed
            if (fetchYouTubeData && updates.youtube_video_id) {
                const youtubeDetails = await this.getYouTubeVideoDetails(updates.youtube_video_id)

                if (youtubeDetails) {
                    finalUpdates = {
                        ...finalUpdates,
                        youtube_thumbnail_url: youtubeDetails.thumbnail_url,
                        duration_seconds: youtubeDetails.duration_seconds
                    }
                }
            }

            const { data, error } = await supabase
                .from('program_lessons')
                .update(finalUpdates)
                .eq('id', lessonId)
                .select()
                .single()

            if (error) throw error

            const index = this.lessons.findIndex(l => l.id === lessonId)
            if (index !== -1) {
                this.lessons[index] = data
            }

            return data
        } catch (err: any) {
            this.error = err.message
            console.error('Error updating lesson:', err)
            throw err
        } finally {
            this.loading = false
        }
    },

    async deleteLesson(lessonId: string) {
        this.loading = true
        this.error = null

        try {
            const { error } = await supabase
                .from('program_lessons')
                .delete()
                .eq('id', lessonId)

            if (error) throw error

            this.lessons = this.lessons.filter(l => l.id !== lessonId)
            this.materials = this.materials.filter(m => m.lesson_id !== lessonId)
        } catch (err: any) {
            this.error = err.message
            console.error('Error deleting lesson:', err)
            throw err
        } finally {
            this.loading = false
        }
    },

    // ============================================
    // MATERIALS ACTIONS
    // ============================================

    async fetchMaterials(programId: string) {
        this.loading = true
        this.error = null

        try {
            const { data, error } = await supabase
                .from('program_materials')
                .select('*')
                .eq('program_id', programId)
                .order('order_index', { ascending: true })

            if (error) throw error

            this.materials = data || []
            return data
        } catch (err: any) {
            this.error = err.message
            console.error('Error fetching materials:', err)
            return []
        } finally {
            this.loading = false
        }
    },

    async uploadMaterial(file: File, programId: string, lessonId: string | null, moduleId: string | null, materialData: Partial<ProgramMaterial>) {
        this.loading = true
        this.error = null

        try {
            // Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `${programId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('program-materials')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Create material record in database
            const { data, error: dbError } = await supabase
                .from('program_materials')
                .insert([{
                    ...materialData,
                    program_id: programId,
                    lesson_id: lessonId,
                    module_id: moduleId,
                    file_path: filePath,
                    file_size_bytes: file.size,
                    file_type: file.type
                }])
                .select()
                .single()

            if (dbError) throw dbError

            this.materials.push(data)
            return data
        } catch (err: any) {
            this.error = err.message
            console.error('Error uploading material:', err)
            throw err
        } finally {
            this.loading = false
        }
    },

    async deleteMaterial(materialId: string, filePath: string) {
        this.loading = true
        this.error = null

        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('program-materials')
                .remove([filePath])

            if (storageError) console.warn('Error deleting file from storage:', storageError)

            // Delete from database
            const { error: dbError } = await supabase
                .from('program_materials')
                .delete()
                .eq('id', materialId)

            if (dbError) throw dbError

            this.materials = this.materials.filter(m => m.id !== materialId)
        } catch (err: any) {
            this.error = err.message
            console.error('Error deleting material:', err)
            throw err
        } finally {
            this.loading = false
        }
    },

    async getMaterialDownloadUrl(filePath: string) {
        const { data } = await supabase.storage
            .from('program-materials')
            .createSignedUrl(filePath, 3600) // 1 hour expiry

        return data?.signedUrl || null
    },

    // ============================================
    // YOUTUBE API HELPER
    // ============================================

    async getYouTubeVideoDetails(videoId: string): Promise < YouTubeVideoDetails | null > {
        try {
            const { data, error } = await supabase.functions.invoke('get-youtube-video-details', {
                body: { videoId }
            })

        if(error) throw error
        return data
        } catch(err: any) {
            console.error('Error fetching YouTube details:', err)
            return null
        }
    },

        // ============================================
        // UTILITY
        // ============================================

        clearError() {
        this.error = null
    },

    resetState() {
        this.modules = []
        this.currentModule = null
        this.lessons = []
        this.currentLesson = null
        this.materials = []
        this.loading = false
        this.error = null
    }
}
})
