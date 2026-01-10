import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Valores padrão para evitar erro se variáveis não estiverem definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Middleware do Next.js para:
 * 1. Refresh automático de sessões expiradas
 * 2. Proteção de rotas autenticadas
 * 3. Redirecionamento de usuários autenticados
 */
export async function middleware(request: NextRequest) {
    // Se variáveis não estão disponíveis, permitir passagem
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials not available in middleware')
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANTE: Não usar getSession() aqui - é vulnerável a ataques
    // Sempre usar getUser() para verificar autenticação no servidor
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Rotas que requerem autenticação
    const protectedRoutes = ['/dashboard', '/aluno']
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    )

    // Se não está autenticado e tenta acessar rota protegida
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
    }

    // Se está autenticado e tenta acessar login/cadastro ou landing page
    const authRoutes = ['/login', '/cadastro']
    const isAuthRoute = authRoutes.some(route => pathname === route)
    const isLandingPage = pathname === '/'

    if (user && (isAuthRoute || isLandingPage)) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - auth/callback (OAuth callback)
         */
        '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
