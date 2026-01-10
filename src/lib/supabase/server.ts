import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Valores padrão para evitar erro durante SSG/build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

/**
 * Cria um cliente Supabase para uso em Server Components e Route Handlers
 * Gerencia cookies automaticamente para manter a sessão
 */
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // O método `setAll` foi chamado de um Server Component.
                        // Isso pode ser ignorado se você tiver middleware refresh da sessão
                    }
                },
            },
        }
    )
}
