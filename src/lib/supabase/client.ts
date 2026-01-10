import { createBrowserClient } from '@supabase/ssr'

// Valores padrão para evitar erro durante SSG/build
// Em runtime no browser, as variáveis de ambiente reais serão usadas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Cria um cliente Supabase para uso no navegador (client-side)
 * Usa cookies automaticamente para gerenciar sessão
 */
export function createClient() {
    // Só cria o cliente se as variáveis estiverem disponíveis
    if (!supabaseUrl || !supabaseAnonKey) {
        // Durante SSG/build, retorna um cliente mock que não faz nada
        // Isso é seguro porque 'use client' garante que o código real
        // só roda no browser onde as variáveis estarão disponíveis
        console.warn('Supabase client created without credentials (SSG/build mode)')
    }

    return createBrowserClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-key'
    )
}
