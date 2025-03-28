import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid user')
    }

    // Check if user already exists in our custom users table
    const { data: existingUser, error: fetchError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (!existingUser) {
      // Get Gravatar URL if no avatar_url is provided
      let avatarUrl = user.user_metadata.avatar_url
      if (!avatarUrl) {
        const emailHash = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(user.email?.toLowerCase().trim())
        )
        avatarUrl = `https://www.gravatar.com/avatar/${Array.from(new Uint8Array(emailHash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')}?d=mp`
      }

      // Insert new user
      const { error: insertError } = await supabaseClient
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          username: user.user_metadata.full_name || user.email?.split('@')[0] || 'Anonymous',
          avatar_url: avatarUrl,
          is_admin: false,
        })

      if (insertError) {
        throw insertError
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
