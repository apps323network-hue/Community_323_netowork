// Types for Programs feature

export type ProgramCategory = 'curso' | 'mentoria' | 'workshop' | 'evento_premium' | 'servico_especializado'
export type ProgramStatus = 'draft' | 'published' | 'archived'

export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface CurriculumModule {
    id?: string
    title: string
    description?: string
    lessons?: Array<{
        id?: string
        title: string
        duration?: number
        content?: string
    }>
}

export interface Program {
    id: string
    title_pt: string
    title_en: string
    description_pt: string
    description_en: string
    short_description_pt?: string
    short_description_en?: string
    category: ProgramCategory
    price_usd: number
    price_brl?: number

    // Enrollment settings
    max_students?: number
    current_students: number
    enrollment_start_date?: string
    enrollment_end_date?: string
    program_start_date?: string
    program_end_date?: string

    // Google Classroom integration
    classroom_enabled: boolean
    classroom_course_id?: string
    classroom_invite_link?: string

    // Media
    thumbnail_url?: string
    banner_url?: string

    // Additional info
    duration_hours?: number

    instructor_name?: string
    instructor_bio?: string
    prerequisites_pt?: string
    prerequisites_en?: string

    // Content
    curriculum_pt?: CurriculumModule[]
    curriculum_en?: CurriculumModule[]

    // Status and visibility
    status: ProgramStatus
    featured: boolean
    localhost_only?: boolean
    terms_content_pt?: string
    terms_content_en?: string

    // Metadata
    created_at: string
    updated_at: string
    created_by?: string

    // Computed fields (from joins)
    average_rating?: number
    total_reviews?: number
    user_enrollment?: ProgramEnrollment
    professors?: Array<{
        id: string
        nome: string
        avatar_url?: string
    }>
}

export interface ProgramEnrollment {
    id: string
    program_id: string
    user_id: string

    // Status
    status: EnrollmentStatus

    // Payment info
    payment_id?: string
    payment_amount?: number
    payment_currency?: string
    payment_status?: PaymentStatus
    payment_method?: string
    paid_at?: string

    // Progress
    progress_percentage: number
    completed_at?: string

    // Classroom
    classroom_added: boolean
    classroom_added_at?: string

    // Certificate
    certificate_issued: boolean
    certificate_url?: string
    certificate_issued_at?: string

    // Metadata
    enrolled_at: string
    updated_at: string

    // Computed fields (from joins)
    program?: Program
    user?: {
        id: string
        nome?: string
        avatar_url?: string
    }
}

export interface ProgramReview {
    id: string
    program_id: string
    user_id: string
    enrollment_id: string

    rating: number
    review_text?: string

    status: ReviewStatus

    created_at: string
    updated_at: string

    // Computed fields (from joins)
    user?: {
        id: string
        nome?: string
        avatar_url?: string
    }
}

export interface CreateProgramData {
    title_pt: string
    title_en: string
    description_pt: string
    description_en: string
    short_description_pt?: string
    short_description_en?: string
    category: ProgramCategory
    price_usd: number
    price_brl?: number
    max_students?: number
    enrollment_start_date?: string
    enrollment_end_date?: string
    program_start_date?: string
    program_end_date?: string
    classroom_enabled?: boolean
    classroom_course_id?: string
    classroom_invite_link?: string
    thumbnail_url?: string
    banner_url?: string
    duration_hours?: number

    instructor_name?: string
    instructor_bio?: string
    prerequisites_pt?: string
    prerequisites_en?: string
    curriculum_pt?: CurriculumModule[]
    curriculum_en?: CurriculumModule[]
    status?: ProgramStatus
    featured?: boolean
    localhost_only?: boolean
    created_by?: string
    professor_ids?: string[]
    terms_content_pt?: string
    terms_content_en?: string
}

export interface UpdateProgramData extends Partial<CreateProgramData> {
    id: string
}

export interface EnrollInProgramData {
    program_id: string
    payment_id?: string
    payment_amount?: number
    payment_currency?: string
    payment_method?: string
    accepted_terms?: boolean
}

export interface SubmitReviewData {
    program_id: string
    enrollment_id: string
    rating: number
    review_text?: string
}
