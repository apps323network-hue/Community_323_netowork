import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type {
    Program,
    ProgramEnrollment,
    CreateProgramData,
    UpdateProgramData,
    EnrollInProgramData,
    SubmitReviewData,
    EnrollmentStatus,
} from '@/types/programs'

interface ProgramsState {
    programs: Program[]
    currentProgram: Program | null
    myEnrollments: ProgramEnrollment[]
    completedLessons: string[] // IDs of completed lessons for current program
    loading: boolean
    error: string | null
}

export const useProgramsStore = defineStore('programs', {
    state: (): ProgramsState => ({
        programs: [],
        currentProgram: null,
        myEnrollments: [],
        completedLessons: [],
        loading: false,
        error: null,
    }),

    getters: {
        publishedPrograms: (state) => state.programs.filter((p) => p.status === 'published'),
        featuredPrograms: (state) => state.programs.filter((p) => p.featured && p.status === 'published'),
        activeEnrollments: (state) => state.myEnrollments.filter((e) => e.status === 'active'),
        completedEnrollments: (state) => state.myEnrollments.filter((e) => e.status === 'completed'),
    },

    actions: {
        // Fetch programs (defaults to only published for public, or all for admin)
        async fetchPrograms(adminMode = false) {
            this.loading = true
            this.error = null

            try {
                let query = supabase
                    .from('programs')
                    .select('*')

                if (!adminMode) {
                    query = query.eq('status', 'published')
                }

                const { data, error } = await query
                    .order('featured', { ascending: false })
                    .order('created_at', { ascending: false })

                if (error) throw error

                // Check which programs have videos
                const programIds = (data || []).map((p: any) => p.id)
                
                if (programIds.length > 0) {
                    // Buscar todas as aulas dos programas
                    const { data: lessonsData, error: lessonsError } = await supabase
                        .from('program_lessons')
                        .select('program_id, youtube_video_id')
                        .in('program_id', programIds)
                    
                    if (lessonsError) {
                        console.warn('Error checking videos:', lessonsError)
                    }
                    
                    // Filtrar programas que têm pelo menos uma aula com vídeo válido (não null e não vazio)
                    const programsWithVideos = new Set(
                        (lessonsData || [])
                            .filter((lesson: any) => 
                                lesson.youtube_video_id !== null && 
                                lesson.youtube_video_id !== '' &&
                                lesson.youtube_video_id.trim() !== ''
                            )
                            .map((lesson: any) => lesson.program_id)
                    )

                    // Add has_videos flag to each program
                    const processedData = (data || []).map((program: any) => ({
                        ...program,
                        has_videos: programsWithVideos.has(program.id)
                    }))

                    this.programs = processedData
                } else {
                    this.programs = (data || []).map((program: any) => ({
                        ...program,
                        has_videos: false
                    }))
                }
            } catch (err: any) {
                this.error = err.message
                console.error('Error fetching programs:', err)
            } finally {
                this.loading = false
            }
        },

        // Fetch program by ID with reviews
        async fetchProgramById(id: string) {
            this.loading = true
            this.error = null

            try {
                // Fetch program data with professors
                const { data: program, error: programError } = await supabase
                    .from('programs')
                    .select(`
                        *,
                        professors:program_professors(
                            professor:profiles(id, nome, avatar_url)
                        )
                    `)
                    .eq('id', id)
                    .single()

                if (programError) throw programError

                // Flatten professors structure
                const flattenedProfessors = (program.professors || []).map((p: any) => p.professor)

                // Fetch reviews for this program
                const { data: reviews, error: reviewsError } = await supabase
                    .from('program_reviews')
                    .select(`
            *,
            user:profiles(id, nome, avatar_url)
          `)
                    .eq('program_id', id)
                    .eq('status', 'approved')

                if (reviewsError) throw reviewsError

                // Calculate average rating
                const totalReviews = reviews?.length || 0
                const averageRating =
                    totalReviews > 0
                        ? reviews!.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
                        : 0

                this.currentProgram = {
                    ...program,
                    professors: flattenedProfessors,
                    average_rating: averageRating,
                    total_reviews: totalReviews,
                }

                // Check if user is enrolled
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: enrollment } = await supabase
                        .from('program_enrollments')
                        .select('*')
                        .eq('program_id', id)
                        .eq('user_id', user.id)
                        .maybeSingle()

                    if (enrollment && this.currentProgram) {
                        this.currentProgram.user_enrollment = enrollment
                    }
                }

                return this.currentProgram
            } catch (err: any) {
                this.error = err.message
                console.error('Error fetching program:', err)
            } finally {
                this.loading = false
            }
        },

        // Fetch user's enrollments
        async fetchMyEnrollments() {
            this.loading = true
            this.error = null

            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('User not authenticated')

                const { data, error } = await supabase
                    .from('program_enrollments')
                    .select(`
            *,
            program:programs(*)
          `)
                    .eq('user_id', user.id)
                    .order('enrolled_at', { ascending: false })

                if (error) throw error

                this.myEnrollments = data || []
            } catch (err: any) {
                this.error = err.message
                console.error('Error fetching enrollments:', err)
            } finally {
                this.loading = false
            }
        },

        // Enroll in a program
        async enrollInProgram(data: EnrollInProgramData) {
            this.loading = true
            this.error = null

            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('User not authenticated')

                // Check if already enrolled
                const { data: existing } = await supabase
                    .from('program_enrollments')
                    .select('id')
                    .eq('program_id', data.program_id)
                    .eq('user_id', user.id)
                    .single()

                if (existing) {
                    throw new Error('Already enrolled in this program')
                }

                // Create enrollment
                // Se payment_method for 'localhost', considerar como pago
                const isLocalhostEnrollment = data.payment_method === 'localhost'
                const paymentStatus = isLocalhostEnrollment ? 'paid' : (data.payment_id ? 'paid' : 'pending')
                
                const { data: enrollment, error } = await supabase
                    .from('program_enrollments')
                    .insert({
                        program_id: data.program_id,
                        user_id: user.id,
                        payment_id: data.payment_id || (isLocalhostEnrollment ? 'localhost-debug' : null),
                        payment_amount: data.payment_amount,
                        payment_currency: data.payment_currency,
                        payment_method: data.payment_method,
                        payment_status: paymentStatus,
                        status: 'active',
                        paid_at: isLocalhostEnrollment || data.payment_id ? new Date().toISOString() : undefined,
                    })
                    .select()
                    .single()

                if (error) throw error

                // Record terms acceptance if provided
                if (data.accepted_terms) {
                    // Fetch program terms to snapshot
                    const { data: program } = await supabase
                        .from('programs')
                        .select('terms_content_pt, terms_content_en')
                        .eq('id', data.program_id)
                        .single()
                    
                    if (program && (program.terms_content_pt || program.terms_content_en)) {
                       await supabase
                        .from('item_terms_acceptance')
                        .insert({
                            user_id: user.id,
                            item_type: 'program',
                            item_id: data.program_id,
                            terms_snapshot_pt: program.terms_content_pt,
                            terms_snapshot_en: program.terms_content_en,
                            ip_address: 'client-side', 
                            user_agent: navigator.userAgent
                        })
                    }
                }

                // Update current students count
                await supabase.rpc('increment_program_students', { program_id: data.program_id })

                // Check for Google Classroom integration and invite
                try {
                    const { data: program } = await supabase
                        .from('programs')
                        .select('classroom_enabled, classroom_course_id')
                        .eq('id', data.program_id)
                        .single()

                    if (program?.classroom_enabled && program?.classroom_course_id) {
                        const { error: inviteError } = await supabase.functions.invoke('classroom_invite', {
                            body: {
                                courseId: program.classroom_course_id,
                                studentEmail: user.email // Ensure user email is available
                            }
                        })

                        if (inviteError) {
                            console.error('Failed to send Classroom invite:', inviteError)
                            // Don't fail the enrollment, just log error. Maybe update enrollment metadata with error status.
                        } else {
                            // Update enrollment to mark classroom invite as sent (optional, if field exists)
                            await supabase
                                .from('program_enrollments')
                                .update({ classroom_added: true, classroom_added_at: new Date().toISOString() })
                                .eq('id', enrollment.id)
                        }
                    }
                } catch (classroomError) {
                    console.error('Error in classroom integration flow:', classroomError)
                }

                // Refresh enrollments
                await this.fetchMyEnrollments()

                return enrollment
            } catch (err: any) {
                this.error = err.message
                console.error('Error enrolling in program:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // Update enrollment progress
        async updateProgress(enrollmentId: string, progress: number) {
            this.loading = true
            this.error = null

            try {
                const updateData: any = {
                    progress_percentage: progress,
                    updated_at: new Date().toISOString(),
                }

                // If progress is 100%, mark as completed
                if (progress >= 100) {
                    updateData.status = 'completed'
                    updateData.completed_at = new Date().toISOString()
                }

                const { data, error } = await supabase
                    .from('program_enrollments')
                    .update(updateData)
                    .eq('id', enrollmentId)
                    .select()
                    .single()

                if (error) throw error

                // Update local state
                const index = this.myEnrollments.findIndex((e) => e.id === enrollmentId)
                if (index !== -1) {
                    this.myEnrollments[index] = data
                }

                return data
            } catch (err: any) {
                this.error = err.message
                console.error('Error updating progress:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // Fetch completed lessons for a program
        async fetchUserProgress(programId: string) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data, error } = await supabase
                    .from('lesson_progress')
                    .select('lesson_id')
                    .eq('user_id', user.id)
                    .eq('program_id', programId)

                if (error) throw error

                this.completedLessons = data.map(item => item.lesson_id)
            } catch (err) {
                console.error('Error fetching user progress:', err)
            }
        },

        // Mark a lesson as complete
        async markLessonComplete(programId: string, lessonId: string) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Check if already completed to avoid unnecessary calls
                if (this.completedLessons.includes(lessonId)) return

                const { error } = await supabase
                    .from('lesson_progress')
                    .upsert({
                        user_id: user.id,
                        program_id: programId,
                        lesson_id: lessonId,
                        completed_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id,lesson_id'
                    })

                if (error) throw error

                // Optimistic update
                if (!this.completedLessons.includes(lessonId)) {
                    this.completedLessons.push(lessonId)
                }

                // Refresh enrollment to get updated percentage (optional, since trigger handles it)
                // But we want the UI to reflect the percentage change eventually
                await this.fetchMyEnrollments()
            } catch (err) {
                console.error('Error marking lesson complete:', err)
            }
        },

        // Submit a review
        async submitReview(data: SubmitReviewData) {
            this.loading = true
            this.error = null

            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('User not authenticated')

                const { data: review, error } = await supabase
                    .from('program_reviews')
                    .insert({
                        program_id: data.program_id,
                        user_id: user.id,
                        enrollment_id: data.enrollment_id,
                        rating: data.rating,
                        review_text: data.review_text,
                        status: 'pending',
                    })
                    .select()
                    .single()

                if (error) throw error

                return review
            } catch (err: any) {
                this.error = err.message
                console.error('Error submitting review:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // Admin: Create program
        async createProgram(data: CreateProgramData) {
            this.loading = true
            this.error = null

            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('User not authenticated')

                // Sanitize data - remove computed fields and non-db columns
                const insertData = { ...(data as any) }
                const professor_ids = insertData.professor_ids

                delete insertData.professor_ids
                delete insertData.professors
                delete insertData.average_rating
                delete insertData.total_reviews
                delete insertData.user_enrollment

                const { data: program, error } = await supabase
                    .from('programs')
                    .insert({
                        ...insertData,
                        created_by: insertData.created_by || user.id,
                        current_students: 0,
                    })
                    .select()
                    .single()

                if (error) throw error

                // Assign professors
                if (professor_ids && professor_ids.length > 0) {
                    const assignments = professor_ids.map((profId: string) => ({
                        program_id: program.id,
                        professor_id: profId
                    }))
                    const { error: profError } = await supabase
                        .from('program_professors')
                        .insert(assignments)
                    if (profError) throw profError
                }

                await this.fetchPrograms(true)

                return program
            } catch (err: any) {
                this.error = err.message
                console.error('Error creating program:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // Admin: Update program
        async updateProgram(data: UpdateProgramData) {
            this.loading = true
            this.error = null

            try {
                // Sanitize data - remove computed fields and non-db columns
                const updateData = { ...(data as any) }
                const id = updateData.id
                const professor_ids = updateData.professor_ids

                delete updateData.id
                delete updateData.created_at
                delete updateData.updated_at
                delete updateData.average_rating
                delete updateData.total_reviews
                delete updateData.user_enrollment
                delete updateData.professors
                delete updateData.professor_ids

                const { data: program, error } = await supabase
                    .from('programs')
                    .update({
                        ...updateData,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', id)
                    .select()
                    .single()

                if (error) throw error

                // Sync professors
                if (professor_ids) {
                    // Delete old assignments
                    const { error: delError } = await supabase
                        .from('program_professors')
                        .delete()
                        .eq('program_id', id)

                    if (delError) throw delError

                    // Add new assignments
                    if (professor_ids.length > 0) {
                        const assignments = professor_ids.map((profId: string) => ({
                            program_id: id,
                            professor_id: profId
                        }))
                        const { error: insError } = await supabase
                            .from('program_professors')
                            .insert(assignments)
                        if (insError) throw insError
                    }
                }

                await this.fetchPrograms(true)

                return program
            } catch (err: any) {
                this.error = err.message
                console.error('Error updating program:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // Admin: Delete program
        async deleteProgram(id: string) {
            this.loading = true
            this.error = null

            try {
                const { error } = await supabase.from('programs').delete().eq('id', id)

                if (error) throw error

                this.programs = this.programs.filter((p) => p.id !== id)
            } catch (err: any) {
                this.error = err.message
                console.error('Error deleting program:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // Admin: Fetch all enrollments for a program
        async fetchProgramEnrollments(programId: string) {
            this.loading = true
            this.error = null

            try {
                const { data, error } = await supabase
                    .from('program_enrollments')
                    .select(`
            *,
            user:profiles(id, nome, avatar_url)
          `)
                    .eq('program_id', programId)
                    .order('enrolled_at', { ascending: false })

                if (error) throw error

                return data || []
            } catch (err: any) {
                this.error = err.message
                console.error('Error fetching program enrollments:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // Admin: Issue certificate
        async issueCertificate(enrollmentId: string, certificateUrl: string) {
            this.loading = true
            this.error = null

            try {
                const { data, error } = await supabase
                    .from('program_enrollments')
                    .update({
                        certificate_issued: true,
                        certificate_url: certificateUrl,
                        certificate_issued_at: new Date().toISOString(),
                    })
                    .eq('id', enrollmentId)
                    .select()
                    .single()

                if (error) throw error

                return data
            } catch (err: any) {
                this.error = err.message
                console.error('Error issuing certificate:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // Admin: Update enrollment status
        async updateEnrollmentStatus(enrollmentId: string, status: EnrollmentStatus) {
            this.loading = true
            this.error = null

            try {
                const { data, error } = await supabase
                    .from('program_enrollments')
                    .update({ status, updated_at: new Date().toISOString() })
                    .eq('id', enrollmentId)
                    .select()
                    .single()

                if (error) throw error

                return data
            } catch (err: any) {
                this.error = err.message
                console.error('Error updating enrollment status:', err)
                throw err
            } finally {
                this.loading = false
            }
        },
    },
})
