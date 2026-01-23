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
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        const baseUrl = 'https://323network.com'
        const today = new Date().toISOString().split('T')[0]

        // Start XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

        // 1. Static Pages
        const staticPages = [
            { loc: '/', changefreq: 'daily', priority: '1.0' },
            { loc: '/programs', changefreq: 'weekly', priority: '0.9' },
            { loc: '/servicos', changefreq: 'weekly', priority: '0.9' },
            { loc: '/eventos', changefreq: 'weekly', priority: '0.8' },
            { loc: '/comunidade', changefreq: 'daily', priority: '0.8' },
            { loc: '/brasileiro-nos-eua', changefreq: 'monthly', priority: '0.9' },
            { loc: '/venture-prep', changefreq: 'monthly', priority: '0.9' },
            { loc: '/parceiros', changefreq: 'monthly', priority: '0.7' },
            { loc: '/beneficios', changefreq: 'monthly', priority: '0.7' },
            { loc: '/contact-us', changefreq: 'yearly', priority: '0.5' },
            { loc: '/termos', changefreq: 'yearly', priority: '0.3' },
            { loc: '/politica-privacidade', changefreq: 'yearly', priority: '0.3' }
        ]

        staticPages.forEach(page => {
            xml += `  <url>\n    <loc>${baseUrl}${page.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`
        })

        // 2. Programs (only published)
        const { data: programs } = await supabase
            .from('programs')
            .select('id, updated_at')
            .eq('status', 'published')

        programs?.forEach(p => {
            const lastmod = p.updated_at ? p.updated_at.split('T')[0] : today
            xml += `  <url>\n    <loc>${baseUrl}/programs/${p.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`
        })

        // 3. Events
        const { data: events } = await supabase
            .from('events')
            .select('id, created_at')
            .order('created_at', { ascending: false })
            .limit(100)

        events?.forEach(e => {
            const lastmod = e.created_at ? e.created_at.split('T')[0] : today
            xml += `  <url>\n    <loc>${baseUrl}/eventos/${e.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`
        })

        // 4. Public Posts
        const { data: posts } = await supabase
            .from('posts')
            .select('id, created_at')
            .order('created_at', { ascending: false })
            .limit(200)

        posts?.forEach(p => {
            const lastmod = p.created_at ? p.created_at.split('T')[0] : today
            xml += `  <url>\n    <loc>${baseUrl}/feed/${p.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`
        })

        // 5. Public Members (if they have is_public or similar)
        // Since MemberProfile requires auth by default in router, we might only include those who are explicitly public if that's a feature.
        // Looking at the SQL columns, there is an 'is_public' column.
        const { data: members } = await supabase
            .from('profiles')
            .select('id, updated_at')
            .eq('is_public', true)
            .limit(500)

        members?.forEach(m => {
            const lastmod = m.updated_at ? m.updated_at.split('T')[0] : today
            xml += `  <url>\n    <loc>${baseUrl}/comunidade/${m.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`
        })

        xml += '</urlset>'

        return new Response(xml, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
