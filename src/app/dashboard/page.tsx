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
  const { user, logout, isAuthenticated, isLoading } = useAuth();

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
      <Header variant="dashboard" user={user} onLogout={logout} />

      {/* Módulos Principais */}
      <main className="flex-grow py-16 pt-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-4">
              O que você deseja fazer hoje?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Conteúdo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom hover:border-slate-300 dark:hover:border-border-hover transition-all hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                  Conteúdo Teórico
                </h3>
                <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 leading-relaxed">
                  Materiais didáticos estruturados e conceitos fundamentais.
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

            {/* Lições */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom hover:border-slate-300 dark:hover:border-border-hover transition-all hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                  Lições Práticas
                </h3>
                <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 leading-relaxed">
                  Exercícios interativos com retorno imediato.
                </p>
                <Link
                  href="/dashboard/licoes"
                  className="block w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all font-medium text-lg"
                >
                  {user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                    ? 'Adicionar Lições'
                    : 'Fazer Lições'}
                </Link>
              </div>
            </motion.div>

            {/* Compilador */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="group bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom hover:border-slate-300 dark:hover:border-border-hover transition-all hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">💻</span>
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
