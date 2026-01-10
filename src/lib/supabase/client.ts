import { createBrowserClient } from '@supabase/ssr'

/**
 * Cria um cliente Supabase para uso no navegador (client-side)
 * Usa cookies automaticamente para gerenciar sessão
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
