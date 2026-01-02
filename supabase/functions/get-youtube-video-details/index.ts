import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')

interface YouTubeVideoDetails {
    id: string
    title: string
    description: string
    thumbnail_url: string
    duration_seconds: number
    published_at: string
}

serve(async (req: Request) => {
    // CORS headers
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        const { videoId } = await req.json()

        if (!videoId) {
            return new Response(
                JSON.stringify({ error: 'Missing videoId parameter' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        if (!YOUTUBE_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'YouTube API key not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Call YouTube Data API v3
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`

        const response = await fetch(youtubeUrl)
        const data = await response.json()

        if (!data.items || data.items.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Video not found or invalid video ID' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const video = data.items[0]

        // Parse ISO 8601 duration (e.g., "PT1H30M15S" -> 5415 seconds)
        const durationString = video.contentDetails.duration
        const durationSeconds = parseISO8601Duration(durationString)

        const videoDetails: YouTubeVideoDetails = {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail_url: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
            duration_seconds: durationSeconds,
            published_at: video.snippet.publishedAt
        }

        return new Response(
            JSON.stringify(videoDetails),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )

    } catch (error) {
        console.error('Error fetching YouTube video details:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
})

// Helper function to parse ISO 8601 duration to seconds
function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

    if (!match) return 0

    const hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    const seconds = parseInt(match[3] || '0', 10)

    return hours * 3600 + minutes * 60 + seconds
}
