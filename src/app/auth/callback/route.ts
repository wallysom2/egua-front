import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Route handler para callback do OAuth
 * Troca o código de autorização por uma sessão
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Login bem-sucedido, redirecionar para dashboard
            return NextResponse.redirect(`${origin}/dashboard`)
        }
    }

    // Erro no callback, redirecionar para login
    return NextResponse.redirect(`${origin}/login?error=auth`)
}
