'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import type { User } from '@/types/user';

interface HeaderProps {
  variant?: 'dashboard' | 'simple' | 'home';
  showBackButton?: boolean;
  backButtonHref?: string;
  extraActions?: React.ReactNode;
  user?: User | null;
  onLogout?: () => void;
  logoHref?: string;
  logoSize?: 'sm' | 'md' | 'lg';
}

export function Header({
  variant = 'simple',
  showBackButton = false,
  backButtonHref = '/dashboard',
  extraActions,
  user,
  onLogout,
  logoHref = '/dashboard',
  logoSize = 'md',
}: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const logoWidth = logoSize === 'sm' ? 32 : logoSize === 'lg' ? 40 : 32;
  const logoHeight = logoWidth;
  const logoClass = logoSize === 'sm' ? 'w-8 h-8' : logoSize === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = logoSize === 'sm' ? 'text-2xl' : logoSize === 'lg' ? 'text-3xl' : 'text-2xl';

  const renderRightActions = () => {
    // Dashboard variant - mostra menu do usuário completo
    if (variant === 'dashboard' && user) {
      return (
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-px h-6 bg-slate-300 dark:bg-border-custom"></div>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-bg-tertiary transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.nome?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-medium text-sm text-slate-900 dark:text-text-primary">
                  {user?.nome?.split(' ')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-slate-500 dark:text-text-secondary capitalize">
                  {user?.tipo || 'Usuário'}
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-slate-500 dark:text-text-tertiary transition-transform ${
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
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-bg-tertiary rounded-xl shadow-lg border border-slate-200 dark:border-border-custom py-2 z-50"
                >
                  {/* Informações do Usuário */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-border-custom">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user?.nome?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-text-primary">
                          {user?.nome || 'Usuário'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-text-tertiary capitalize">
                          {user?.tipo || 'Usuário'}
                        </p>
                        {user?.email && (
                          <p className="text-xs text-slate-400 dark:text-text-tertiary">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Mobile - Links */}
                  <div className="md:hidden border-b border-slate-200 dark:border-border-custom">
                    <Link
                      href="/dashboard/conteudo"
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-bg-tertiary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      📚 <span>Conteúdo Teórico</span>
                    </Link>
                    <Link
                      href="/dashboard/licoes"
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-bg-tertiary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      🎯 <span>Lições Práticas</span>
                    </Link>
                    <Link
                      href="/dashboard/compilador"
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-bg-tertiary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      💻 <span>Compilador Online</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  {onLogout && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
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
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    // Home variant - mostra botão "Entrar" e link "Sobre"
    if (variant === 'home') {
      return (
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/sobre"
              className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-base"
            >
              Sobre
            </Link>
          </motion.div>
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/login"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-2 shadow-lg text-white"
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
              Entrar
            </Link>
          </motion.div>
        </div>
      );
    }

    // Simple variant - BackButton + ThemeToggle + extraActions
    return (
      <div className="flex items-center gap-3">
        {showBackButton && <BackButton href={backButtonHref} />}
        {extraActions}
        <ThemeToggle />
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full z-40 py-4 border-b border-slate-200/50 dark:header-border-custom backdrop-blur-sm"
        style={{
          backgroundColor: variant === 'home' 
            ? 'var(--color-header-bg)' 
            : 'var(--color-header-bg-opacity)',
        }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={logoHref}
              className={`${textSize} font-bold text-slate-900 dark:text-text-primary flex items-center gap-2 ${
                logoSize === 'lg' ? 'gap-3' : 'gap-2'
              }`}
            >
              <Image
                src="/hu.png"
                alt="Senior Code AI Logo"
                width={logoWidth}
                height={logoHeight}
                className={logoClass}
              />
              <span>Senior Code AI</span>
            </Link>
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {renderRightActions()}
          </div>
        </div>
      </motion.div>

      {/* Overlay para fechar menu do usuário */}
      {userMenuOpen && variant === 'dashboard' && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  );
}

