'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  Code,
  ChevronDown,
  User,
  UserCog,
  LogOut,
  LogIn
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import type { User as UserType } from '@/types/user';

interface HeaderProps {
  variant?: 'dashboard' | 'simple' | 'home';
  showBackButton?: boolean;
  backButtonHref?: string;
  extraActions?: React.ReactNode;
  user?: UserType | null;
  onLogout?: () => void;
  logoHref?: string;
  logoSize?: 'sm' | 'md' | 'lg';
  customTitle?: string;
  hideLogo?: boolean;
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
  customTitle,
  hideLogo = false,
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
        <div className="flex items-center gap-1.5 sm:gap-3">
          {extraActions}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-300 dark:bg-border-custom px-0 mx-1"></div>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-bg-tertiary transition-colors"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.nome}
                  className="w-9 h-9 rounded-full object-cover border-2 border-blue-400"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-brand-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.nome?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="font-medium text-sm text-slate-900 dark:text-text-primary">
                  {user?.nome?.split(' ')[0] || 'Usuário'}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 dark:text-text-tertiary transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              />
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
                  {/* Menu Mobile - Links */}
                  <div className="md:hidden border-b border-slate-200 dark:border-border-custom">
                    <Link
                      href="/dashboard/conteudo"
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-bg-tertiary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>Conteúdo Teórico</span>
                    </Link>
                    <Link
                      href="/dashboard/minhas-turmas"
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-bg-tertiary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Users className="w-5 h-5" />
                      <span>Turmas</span>
                    </Link>
                    <Link
                      href="/dashboard/compilador"
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-bg-tertiary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Code className="w-5 h-5" />
                      <span>Compilador Online</span>
                    </Link>
                  </div>

                  {/* Meu Perfil - Para todos os usuários */}
                  <div className="border-b border-slate-200 dark:border-border-custom">
                    <Link
                      href="/dashboard/perfil"
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-bg-tertiary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Meu Perfil</span>
                    </Link>
                  </div>

                  {/* Admin - Apenas para desenvolvedores */}
                  {user?.tipo?.toLowerCase() === 'desenvolvedor' && (
                    <div className="border-b border-slate-200 dark:border-border-custom">
                      <Link
                        href="/dashboard/usuarios"
                        className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-text-secondary hover:bg-slate-50 dark:hover:bg-bg-tertiary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserCog className="w-5 h-5" />
                        <span className="font-medium">Gerenciar Usuários</span>
                      </Link>
                    </div>
                  )}

                  {/* Logout */}
                  {onLogout && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
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
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-brand-500 hover:from-blue-600 hover:to-brand-600 transition-all flex items-center gap-2 shadow-lg text-white"
            >
              <LogIn className="w-5 h-5" />
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
          {/* Logo - Hidden on mobile for dashboard variant */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={variant === 'dashboard' ? 'hidden sm:block' : ''}
          >
            <Link
              href={logoHref}
              className={`${textSize} font-bold text-slate-900 dark:text-text-primary flex items-center gap-2 ${logoSize === 'lg' ? 'gap-3' : 'gap-2'
                }`}
            >
              {!hideLogo && (
                <Image
                  src="/hu.png"
                  alt="Senior Code AI Logo"
                  width={logoWidth}
                  height={logoHeight}
                  className={logoClass}
                />
              )}
              <span className={variant === 'dashboard' ? 'hidden md:inline' : ''}>{customTitle || 'Senior Code AI'}</span>
            </Link>
          </motion.div>

          {/* Right Actions - Aligned to the right */}
          <div className="flex items-center gap-1 sm:gap-4 ml-auto">
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
