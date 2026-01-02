import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type {
    Program,
    ProgramEnrollment,
    CreateProgramData,
    UpdateProgramData,
    EnrollInProgramData,
    SubmitReviewData,
} from '@/types/programs'

interface ProgramsState {
    programs: Program[]
    currentProgram: Program | null
    myEnrollments: ProgramEnrollment[]
    loading: boolean
    error: string | null
}

export const useProgramsStore = defineStore('programs', {
    state: (): ProgramsState => ({
        programs: [],
        currentProgram: null,
        myEnrollments: [],
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
        // Fetch all published programs
        async fetchPrograms() {
            this.loading = true
            this.error = null

            try {
                const { data, error } = await supabase
                    .from('programs')
                    .select('*')
                    .eq('status', 'published')
                    .order('featured', { ascending: false })
                    .order('created_at', { ascending: false })

                if (error) throw error

                this.programs = data || []
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
                // Fetch program data
                const { data: program, error: programError } = await supabase
                    .from('programs')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (programError) throw programError

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
                const { data: enrollment, error } = await supabase
                    .from('program_enrollments')
                    .insert({
                        program_id: data.program_id,
                        user_id: user.id,
                        payment_id: data.payment_id,
                        payment_amount: data.payment_amount,
                        payment_currency: data.payment_currency,
                        payment_method: data.payment_method,
                        payment_status: data.payment_id ? 'paid' : 'pending',
                        status: 'active',
                        paid_at: data.payment_id ? new Date().toISOString() : undefined,
                    })
                    .select()
                    .single()

                if (error) throw error

                if (error) throw error

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

                const { data: program, error } = await supabase
                    .from('programs')
                    .insert({
                        ...data,
                        created_by: user.id,
                        current_students: 0,
                    })
                    .select()
                    .single()

                if (error) throw error

                await this.fetchPrograms()

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
                const { id, ...updateData } = data

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

                await this.fetchPrograms()

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
    },
})
