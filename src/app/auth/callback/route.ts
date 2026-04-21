import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'
  const flow = searchParams.get('flow') // 'login' or 'signup'

  console.log('Auth callback received:', { code, next, flow, origin, fullUrl: request.url })

  if (code) {
    try {
      const supabase = await createClient()
      console.log('Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        console.log('Auth callback successful, session data:', data)
        
        // Get the user after session exchange
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('Failed to get user after OAuth:', userError)
          return NextResponse.redirect(`${origin}/onboarding?authError=true`)
        }
        
        console.log('OAuth user:', user.id, user.email)
        
        // Check if user has a profile in the database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, created_at')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (profileError) {
          console.error('Error checking profile:', profileError)
          // Continue anyway, assume no profile
        }
        
        const hasProfile = !!profile
        
        console.log('User profile check:', { 
          hasProfile, 
          flow, 
          profileId: profile?.id,
          profileName: profile?.full_name,
          profileCreated: profile?.created_at,
          userId: user.id 
        })
        
        // Handle based on flow and profile existence
        if (flow === 'login') {
          // Login flow: user must have profile
          if (!hasProfile) {
            // No profile - redirect to login with error
            const emailParam = user.email ? `&email=${encodeURIComponent(user.email)}` : ''
            const redirectUrl = `${origin}/login?error=no_account${emailParam}`
            console.log('Login flow - no profile, redirecting to:', redirectUrl)
            return NextResponse.redirect(redirectUrl)
          }
          // Has profile - redirect to next (dashboard)
          const redirectUrl = `${origin}${next}`
          console.log('Login flow - has profile, redirecting to:', redirectUrl)
          return NextResponse.redirect(redirectUrl)
        } 
        else if (flow === 'signup') {
          // Signup flow
          if (hasProfile) {
            // Already has profile - redirect to dashboard with message
            const redirectUrl = `${origin}/dashboard?message=already_signed_up`
            console.log('Signup flow - already has profile, redirecting to:', redirectUrl)
            return NextResponse.redirect(redirectUrl)
          }
          // New user - redirect to dashboard (not create-need)
          const redirectUrl = `${origin}/dashboard?new_user=true`
          console.log('Signup flow - new user, redirecting to dashboard:', redirectUrl)
          return NextResponse.redirect(redirectUrl)
        }
        else {
          // No flow specified (backward compatibility) - use old behavior
          const redirectUrl = `${origin}${next}?resumedAuth=true`
          console.log('No flow specified, redirecting to:', redirectUrl)
          return NextResponse.redirect(redirectUrl)
        }
      } else {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${origin}/onboarding?authError=true`)
      }
    } catch (error) {
      console.error("Auth callback unexpected error:", error)
      return NextResponse.redirect(`${origin}/onboarding?authError=true`)
    }
  }

  // If no code, redirect to onboarding
  console.log('No code in callback URL, redirecting to onboarding')
  return NextResponse.redirect(`${origin}/onboarding?authError=true`)
}
