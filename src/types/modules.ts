export interface ProgramModule {
    id: string
    program_id: string
    title_pt: string
    title_en: string
    description_pt: string | null
    description_en: string | null
    order_index: number
    created_at: string
    updated_at: string
    lessons?: ProgramLesson[]
}

export interface ProgramLesson {
    id: string
    module_id: string
    program_id: string
    title_pt: string
    title_en: string
    description_pt: string | null
    description_en: string | null
    youtube_video_id: string
    youtube_thumbnail_url: string | null
    duration_seconds: number | null
    order_index: number
    is_preview: boolean
    created_at: string
    updated_at: string
    materials?: ProgramMaterial[]
}

export interface ProgramMaterial {
    id: string
    lesson_id: string | null
    module_id: string | null
    program_id: string
    title_pt: string
    title_en: string
    description_pt: string | null
    description_en: string | null
    file_path: string
    file_size_bytes: number | null
    file_type: string
    order_index: number
    created_at: string
}

export interface ProgramProfessor {
    id: string
    program_id: string
    professor_id: string
    assigned_at: string
    professor?: {
        id: string
        full_name: string
        avatar_url: string | null
    }
}

export interface YouTubeVideoDetails {
    id: string
    title: string
    description: string
    thumbnail_url: string
    duration_seconds: number
    published_at: string
}
