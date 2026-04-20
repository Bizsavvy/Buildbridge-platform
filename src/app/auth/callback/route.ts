import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Append a query param to tell onboarding that auth succeeded and it should resume
        return NextResponse.redirect(`${origin}${next}?resumedAuth=true`)
      } else {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${origin}/onboarding?authError=true`)
      }
    } catch (error) {
      console.error("Auth callback unexpected error:", error)
      return NextResponse.redirect(`${origin}/onboarding?authError=true`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
