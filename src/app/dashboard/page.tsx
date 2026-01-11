'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-bg-primary dark:via-bg-secondary dark:to-bg-primary text-slate-900 dark:text-text-primary transition-colors">
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

          <div className={`grid grid-cols-1 ${user?.tipo === 'aluno' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 max-w-5xl mx-auto`}>
            {/* Conteúdo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom hover:border-slate-300 dark:hover:border-border-hover transition-all hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                  Conteúdo Teórico
                </h3>
                <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 leading-relaxed">
                  Materiais didáticos estruturados.
                </p>
                <Link
                  href="/dashboard/conteudo"
                  className="block w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-medium text-lg"
                >
                  {user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                    ? 'Adicionar Conteúdo'
                    : 'Estudar Conteúdo'}
                </Link>
              </div>
            </motion.div>

            {/* Lições - Apenas para professores/desenvolvedores */}
            {(user?.tipo === 'professor' || user?.tipo === 'desenvolvedor') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom hover:border-slate-300 dark:hover:border-border-hover transition-all hover:shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                    Lições Práticas
                  </h3>
                  <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 leading-relaxed">
                    Crie e gerencie exercícios interativos.
                  </p>
                  <Link
                    href="/dashboard/licoes"
                    className="block w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all font-medium text-lg"
                  >
                    Gerenciar Lições
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Turmas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: user?.tipo === 'aluno' ? 0.3 : 0.4 }}
              className="group bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom hover:border-orange-300 dark:hover:border-orange-500/50 transition-all hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                  Turmas
                </h3>
                <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 leading-relaxed">
                  {user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                    ? 'Crie turmas e acompanhe seus alunos.'
                    : 'Acesse suas turmas e trilhas de aprendizado.'}
                </p>
                <Link
                  href={user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                    ? '/dashboard/turmas'
                    : '/dashboard/minhas-turmas'}
                  className="block w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium text-lg"
                >
                  {user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                    ? 'Gerenciar Turmas'
                    : 'Minhas Turmas'}
                </Link>
              </div>
            </motion.div>

            {/* Compilador */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: user?.tipo === 'aluno' ? 0.4 : 0.5 }}
              className="group bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom hover:border-slate-300 dark:hover:border-border-hover transition-all hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 18" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                  Compilador Online
                </h3>
                <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 leading-relaxed">
                  Editor de código com execução em tempo real.
                </p>
                <Link
                  href="/dashboard/compilador"
                  className="block w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all font-medium text-lg"
                >
                  Abrir Compilador
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:footer-border-custom bg-slate-50/30 footer-bg mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-600 dark:text-text-secondary">
            Senior Code AI
          </p>
        </div>
      </footer>
    </div>
  );
}
