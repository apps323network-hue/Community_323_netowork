import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client with service role key
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        console.log('Running daily program notifications check...')

        // Call the database functions
        const { error: startingError } = await supabase.rpc('check_programs_starting_soon')

        if (startingError) {
            console.error('Error checking programs starting soon:', startingError)
        } else {
            console.log('✓ Programs starting soon check completed')
        }

        const { error: expiringError } = await supabase.rpc('check_programs_expiring_soon')

        if (expiringError) {
            console.error('Error checking programs expiring soon:', expiringError)
        } else {
            console.log('✓ Programs expiring soon check completed')
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Daily program notifications check completed',
                errors: {
                    starting: startingError ? startingError.message : null,
                    expiring: expiringError ? expiringError.message : null,
                }
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error in daily-program-notifications:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
