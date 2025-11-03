'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';

import { API_BASE_URL } from '@/config/api';

interface Conteudo {
  id: number;
  titulo: string;
  corpo: string;
  nivel_leitura: 'basico' | 'intermediario';
  linguagem_id: number;
  linguagem?: {
    nome: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface PageParams {
  id: string;
}

function useConteudo(id: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conteudo, setConteudo] = useState<Conteudo | null>(null);

  const checkUserType = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar tipo de usuário');
      }

      // ... existing code ...
    } catch (error) {
      console.error('Erro ao verificar tipo de usuário:', error);
    }
  }, []);

  const fetchConteudo = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/conteudos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Conteúdo não encontrado');
      }

      const data = await response.json();
      setConteudo(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Erro ao carregar conteúdo',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      await fetch(`${API_BASE_URL}/conteudos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      window.location.href = '/dashboard/conteudo';
    } catch (error) {
      console.error('Erro ao excluir conteúdo:', error);
    }
  };

  useEffect(() => {
    checkUserType();
    fetchConteudo();
  }, [checkUserType, fetchConteudo]);

  return {
    loading,
    error,
    conteudo,
    handleDelete,
  };
}


function ConteudoNaoEncontrado() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Senior Code AI
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="text-4xl mb-4">📄</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Conteúdo não encontrado
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          O conteúdo que você está procurando não existe ou foi removido.
        </p>
        <Link
          href="/dashboard/conteudo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Voltar
        </Link>
      </div>
    </div>
  );
}

function ConteudoView({
  conteudo,
}: {
  conteudo: Conteudo;
  onDelete: () => void;
}) {
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
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
            </motion.div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botão Voltar */}
      <BackButton href="/dashboard/conteudo" />

      {/* Conteúdo Principal */}
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Cabeçalho do Conteúdo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            {/* Tags de Informação */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-sm ${
                  conteudo.nivel_leitura === 'basico'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                }`}
              >
                {conteudo.nivel_leitura === 'basico' ? 'Básico' : 'Intermediário'}
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              {conteudo.titulo}
            </h1>

            {/* Descrição */}
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {conteudo.corpo.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
          </motion.div>

          {/* Conteúdo do Artigo */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-12"
          >
            <div
              className="prose prose-lg prose-slate dark:prose-invert max-w-none
                prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
                prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
                prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-5
                prose-p:text-slate-700 dark:prose-p:text-slate-300
                prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-blue-600 dark:prose-a:text-blue-400
                prose-a:no-underline hover:prose-a:underline
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-strong:font-semibold
                prose-code:bg-slate-100 dark:prose-code:bg-slate-800
                prose-code:text-slate-900 dark:prose-code:text-slate-100
                prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm
                prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950
                prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-800
                prose-pre:shadow-lg prose-pre:rounded-lg
                prose-blockquote:border-l-4 prose-blockquote:border-l-blue-500
                prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
                prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                prose-blockquote:not-italic prose-blockquote:shadow-sm
                prose-ul:text-slate-700 dark:prose-ul:text-slate-300
                prose-ol:text-slate-700 dark:prose-ol:text-slate-300
                prose-li:text-slate-700 dark:prose-li:text-slate-300
                prose-li:my-2
                prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: conteudo.corpo }}
            />
          </motion.article>

          {/* Botão Voltar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="pt-8 border-t border-slate-200 dark:border-slate-700 flex justify-end"
          >
            <Link
              href="/dashboard/conteudo"
              className="inline-flex items-center gap-2 px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 font-medium group"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Voltar
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function VisualizarConteudoPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = use(params);
  const { loading, error, conteudo, handleDelete } = useConteudo(
    resolvedParams.id,
  );

  if (loading) return <Loading text="Carregando..." />;
  if (error || !conteudo) return <ConteudoNaoEncontrado />;

  return <ConteudoView conteudo={conteudo} onDelete={handleDelete} />;
}
