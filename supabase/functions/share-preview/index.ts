import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const type = url.searchParams.get('type') // 'program' or 'event'
        const id = url.searchParams.get('id')
        const lang = url.searchParams.get('lang') || 'pt'

        if (!id || !type) {
            return new Response("Missing ID or Type", { status: 400 })
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        let title = "323 Network"
        let description = "Connecting Brazilians in the USA"
        let image = "https://323network.com/favicon.png"
        let redirectUrl = "https://323network.com"

        if (type === 'program') {
            const { data: program } = await supabase
                .from('programs')
                .select('*')
                .eq('id', id)
                .single()

            if (program) {
                title = lang === 'en' ? (program.title_en || program.title_pt) : (program.title_pt || program.title_en)
                description = lang === 'en' ? (program.description_en || program.description_pt) : (program.description_pt || program.description_en)
                image = program.banner_url || image
                redirectUrl = `https://323network.com/programas/${id}`
            }
        } else if (type === 'event') {
            const { data: event } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single()

            if (event) {
                title = lang === 'en' ? (event.titulo_en || event.titulo_pt) : (event.titulo_pt || event.titulo_en)
                description = lang === 'en' ? (event.descricao_en || event.descricao_pt) : (event.descricao_pt || event.descricao_en)
                image = event.image_url || image
                redirectUrl = `https://323network.com/eventos/${id}`
            }
        }

        // Clean description for meta tags
        const cleanDescription = description?.substring(0, 160).replace(/["']/g, "") || ""
        const cleanTitle = title?.replace(/["']/g, "") || ""

        const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <title>${cleanTitle}</title>
    
    <!-- Open Graph / Meta Tags for Social Preview -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${redirectUrl}">
    <meta property="og:title" content="${cleanTitle}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="323 Network">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${cleanTitle}">
    <meta name="twitter:description" content="${cleanDescription}">
    <meta name="twitter:image" content="${image}">

    <!-- Automatic Redirect to the actual App -->
    <meta http-equiv="refresh" content="0;url=${redirectUrl}">
    <script>
        window.location.href = "${redirectUrl}";
    </script>
</head>
<body>
    <p>Redirecting to <a href="${redirectUrl}">${cleanTitle}</a>...</p>
</body>
</html>
    `

        return new Response(html, {
            headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
