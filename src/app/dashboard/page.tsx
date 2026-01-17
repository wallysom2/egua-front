'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Users, Code } from 'lucide-react';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const { user, signOut, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <Loading text="Carregando..." />;
  }

  return (
    <>
      <Header variant="dashboard" user={user} onLogout={signOut} />

      {/* Módulos Principais */}
      <main className="flex-grow py-16 pt-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Conteúdo */}
            <Link href="/dashboard/conteudo">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom hover:border-blue-300 dark:hover:border-blue-500/50 transition-all hover:shadow-2xl cursor-pointer h-full"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                    Conteúdo Teórico
                  </h3>
                  <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 leading-relaxed">
                    Materiais didáticos estruturados.
                  </p>
                  <div className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 text-white rounded-lg transition-all font-medium text-lg">
                    {user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                      ? 'Adicionar Conteúdo'
                      : 'Estudar Conteúdo'}
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Turmas */}
            <Link href={user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
              ? '/dashboard/turmas'
              : '/dashboard/minhas-turmas'}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom hover:border-brand-300 dark:hover:border-brand-500/50 transition-all hover:shadow-2xl cursor-pointer h-full"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                    Turmas
                  </h3>
                  <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 leading-relaxed">
                    {user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                      ? 'Crie turmas e acompanhe seus alunos.'
                      : 'Acesse suas turmas e trilhas de aprendizado.'}
                  </p>
                  <div className="w-full py-4 px-6 bg-gradient-to-r from-brand-500 to-brand-600 group-hover:from-brand-600 group-hover:to-brand-700 text-white rounded-lg transition-all font-medium text-lg">
                    {user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                      ? 'Gerenciar Turmas'
                      : 'Minhas Turmas'}
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Compilador */}
            <Link href="/dashboard/compilador">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom hover:border-purple-300 dark:hover:border-purple-500/50 transition-all hover:shadow-2xl cursor-pointer h-full"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Code className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                    Compilador Online
                  </h3>
                  <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 leading-relaxed">
                    Editor de código com execução em tempo real.
                  </p>
                  <div className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700 text-white rounded-lg transition-all font-medium text-lg">
                    Abrir Compilador
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
