/**
 * n8n Integration Service
 * Handles communication with n8n workflows
 */

const N8N_WEBHOOK_BASE_URL = 'https://nwh.suaiden.com'

export interface YouTubeUploadPayload {
    videoFile: File
    title_pt: string
    title_en: string
    description_pt: string
    description_en: string
    professor_id: string
    lesson_id: string
    program_id: string
    privacy_status?: 'unlisted' | 'private' | 'public'
}

export interface YouTubeUploadResponse {
    success: boolean
    message: string
    video_id?: string
    duration_seconds?: number
    thumbnail_url?: string
}

/**
 * Upload video to YouTube via n8n workflow
 * This is an asynchronous operation - n8n will process the video and send an in-app notification when complete
 */
export async function uploadVideoToYouTube(
    payload: YouTubeUploadPayload
): Promise<YouTubeUploadResponse> {
    const formData = new FormData()

    // Append video file
    formData.append('video_file', payload.videoFile)

    // Append metadata
    formData.append('title_pt', payload.title_pt)
    formData.append('title_en', payload.title_en)
    formData.append('description_pt', payload.description_pt || '')
    formData.append('description_en', payload.description_en || '')
    formData.append('professor_id', payload.professor_id)
    formData.append('lesson_id', payload.lesson_id)
    formData.append('program_id', payload.program_id)
    formData.append('privacy_status', payload.privacy_status || 'unlisted')

    try {
        const response = await fetch(`${N8N_WEBHOOK_BASE_URL}/webhook/youtube-upload`, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`n8n upload failed: ${response.status} - ${errorText}`)
        }

        const result: YouTubeUploadResponse = await response.json()
        return result

    } catch (error) {
        console.error('Error uploading to n8n:', error)
        throw error
    }
}

/**
 * Upload video with XHR to track progress
 */
export function uploadVideoToYouTubeWithProgress(
    payload: YouTubeUploadPayload,
    onProgress: (progress: number) => void
): Promise<YouTubeUploadResponse> {
    return new Promise((resolve, reject) => {
        const formData = new FormData()

        formData.append('video_file', payload.videoFile)
        formData.append('title_pt', payload.title_pt)
        formData.append('title_en', payload.title_en)
        formData.append('description_pt', payload.description_pt || '')
        formData.append('description_en', payload.description_en || '')
        formData.append('professor_id', payload.professor_id)
        formData.append('lesson_id', payload.lesson_id)
        formData.append('program_id', payload.program_id)
        formData.append('privacy_status', payload.privacy_status || 'unlisted')

        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${N8N_WEBHOOK_BASE_URL}/webhook/youtube-upload`, true)

        // Track upload progress
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100)
                onProgress(progress)
            }
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                // If n8n returns a success string (asynchronous), treat as success
                const text = xhr.responseText.toLowerCase()
                if (text.includes('workflow') && text.includes('started')) {
                    resolve({
                        success: true,
                        message: 'Workflow started'
                    })
                    return
                }

                try {
                    const response: YouTubeUploadResponse = JSON.parse(xhr.responseText)
                    resolve(response)
                } catch (error) {
                    // If it's not JSON but status is OK, it's likely a plain text success message
                    resolve({
                        success: true,
                        message: xhr.responseText
                    })
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`))
            }
        }

        xhr.onerror = () => {
            reject(new Error('Network error during upload to n8n'))
        }

        xhr.send(formData)
    })
}
