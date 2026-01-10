'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User, TipoUsuario } from '@/types/user';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, nome: string, tipo: TipoUsuario) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Converte usuário Supabase para formato da aplicação
 */
function mapSupabaseUserToAppUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    nome: supabaseUser.user_metadata?.nome || supabaseUser.user_metadata?.full_name || 'Usuário',
    tipo: (supabaseUser.user_metadata?.tipo as TipoUsuario) || 'aluno',
    ativo: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Carregar sessão inicial e escutar mudanças de autenticação
  useEffect(() => {
    // Obter sessão atual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        setIsLoading(false);

        // Refresh da página quando login/logout ocorrer
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  /**
   * Login com email e senha
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch {
      return { error: 'Erro ao fazer login. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  /**
   * Cadastro com email e senha
   */
  const signUp = useCallback(async (
    email: string,
    password: string,
    nome: string,
    tipo: TipoUsuario
  ) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            tipo,
            full_name: nome,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch {
      return { error: 'Erro ao criar conta. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  /**
   * Login com Google OAuth
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch {
      return { error: 'Erro ao fazer login com Google.' };
    }
  }, [supabase]);

  /**
   * Logout
   */
  const signOut = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
    router.push('/login');
  }, [supabase, router]);

  const user = mapSupabaseUserToAppUser(supabaseUser);

  const value = {
    user,
    supabaseUser,
    session,
    isAuthenticated: !!session && !!supabaseUser,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar o contexto de autenticação
 * @throws Error se usado fora do AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
