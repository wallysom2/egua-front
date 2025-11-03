'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Navbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div>
              <Link
                href="/dashboard"
                className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <Image
                  src="/hu.png"
                  alt="Senior Code AI Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span>Senior Code AI</span>
              </Link>
            </div>

            {/* Área do Usuário */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Separador */}
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>

              {/* Menu do Usuário */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.nome?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                      {user?.nome?.split(' ')[0] || 'Usuário'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {user?.tipo || 'Usuário'}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2"
                    >
                      {/* Informações do Usuário */}
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {user?.nome?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {user?.nome || 'Usuário'}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                              {user?.tipo || 'Usuário'}
                            </p>
                            {user?.email && (
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {user.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Mobile - Links */}
                      <div className="md:hidden border-b border-slate-200 dark:border-slate-700">
                        <Link
                          href="/dashboard/conteudo"
                          className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          📚 <span>Conteúdo Teórico</span>
                        </Link>
                        <Link
                          href="/dashboard/licoes"
                          className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          🎯 <span>Lições Práticas</span>
                        </Link>
                        <Link
                          href="/dashboard/compilador"
                          className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          💻 <span>Compilador Online</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                          />
                        </svg>
                        <span className="font-medium">Sair da conta</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overlay para fechar menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setUserMenuOpen(false)}
        />
      )}

      {/* Módulos Principais */}
      <main className="flex-grow py-16 pt-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              O que você deseja fazer hoje?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Conteúdo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group bg-white dark:bg-slate-900 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                  Conteúdo Teórico
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
                  Materiais didáticos estruturados e conceitos fundamentais.
                </p>
                <Link
                  href="/dashboard/conteudo"
                  className="block w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-medium text-lg"
                >
                  Estudar Conteúdo
                </Link>
              </div>
            </motion.div>

            {/* Lições */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group bg-white dark:bg-slate-900 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                  Lições Práticas
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
                  Exercícios interativos com retorno imediato.
                </p>
                <Link
                  href="/dashboard/licoes"
                  className="block w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all font-medium text-lg"
                >
                  Fazer Lições
                </Link>
              </div>
            </motion.div>

            {/* Compilador */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="group bg-white dark:bg-slate-900 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">💻</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                  Compilador Online
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
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
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Senior Code AI
          </p>
        </div>
      </footer>
    </div>
  );
}
