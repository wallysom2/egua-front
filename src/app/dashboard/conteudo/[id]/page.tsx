"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Conteudo {
  id: number;
  titulo: string;
  corpo: string;
  nivel_leitura: "basico" | "intermediario";
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

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function useConteudo(id: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conteudo, setConteudo] = useState<Conteudo | null>(null);
  const [isProfessor, setIsProfessor] = useState(false);
  const [isDesenvolvedor, setIsDesenvolvedor] = useState(false);
  const router = useRouter();

  const checkUserType = useCallback(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setIsProfessor(userData.tipo === "professor");
      setIsDesenvolvedor(userData.tipo === "desenvolvedor");
    }
  }, []);

  const fetchConteudo = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/conteudos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error("Conteúdo não encontrado");
      }

      const data = await response.json();
      setConteudo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar conteúdo");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("⚠️ Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita.")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/conteudos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir conteúdo");
      }

      router.push("/dashboard/conteudo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir conteúdo");
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
    isProfessor,
    isDesenvolvedor,
    handleDelete
  };
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Carregando conteúdo...</p>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Preparando a melhor experiência de leitura para você</p>
      </motion.div>
    </div>
  );
}

function ConteudoNaoEncontrado() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 hover:scale-105 transition-transform"
              >
                🏛️ <span>Égua</span>
              </Link>
              <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
                <span>›</span>
                <Link href="/dashboard/conteudo" className="hover:text-slate-900 dark:hover:text-white transition-colors">Conteúdo</Link>
                <span>›</span>
                <span className="text-slate-900 dark:text-white font-medium">Não encontrado</span>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white dark:bg-slate-900/50 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Conteúdo não encontrado</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">
            O conteúdo que você está procurando não existe ou foi removido.
          </p>
          <Link
            href="/dashboard/conteudo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Voltar para Biblioteca
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function ConteudoView({ 
  conteudo, 
  isProfessor, 
  isDesenvolvedor, 
  onDelete 
}: { 
  conteudo: Conteudo; 
  isProfessor: boolean;
  isDesenvolvedor: boolean;
  onDelete: () => void;
}) {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const readingTime = estimateReadingTime(conteudo.corpo);
  const canEdit = isProfessor || isDesenvolvedor;

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showActionsMenu && !target.closest('.actions-menu-container')) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsMenu]);

  // Fechar menu com ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [showActionsMenu]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 hover:scale-105 transition-transform"
              >
                🏛️ <span>Égua</span>
              </Link>
              <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
                <span>›</span>
                <Link href="/dashboard/conteudo" className="hover:text-slate-900 dark:hover:text-white transition-colors">Conteúdo</Link>
                <span>›</span>
                <span className="text-slate-900 dark:text-white font-medium line-clamp-1">Leitura</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {canEdit && (
                <div className="relative actions-menu-container">
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Ações do conteúdo"
                    aria-label="Menu de ações"
                    aria-expanded={showActionsMenu}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {showActionsMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50"
                      >
                        <Link
                          href={`/dashboard/conteudo/editar/${conteudo.id}`}
                          className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          onClick={() => setShowActionsMenu(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Editar conteúdo
                        </Link>
                        <button
                          onClick={() => {
                            setShowActionsMenu(false);
                            onDelete();
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Excluir conteúdo
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Article Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">
              {conteudo.nivel_leitura === "basico" ? "" : ""}
            </div>
            <div className="flex flex-wrap gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  conteudo.nivel_leitura === "basico"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700"
                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                }`}
              >
                {conteudo.nivel_leitura === "basico" ? "📚 Nível Básico" : "🎯 Nível Intermediário"}
              </span>
              {conteudo.linguagem && (
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full text-sm font-medium">
                  💻 {conteudo.linguagem.nome}
                </span>
              )}
              <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium">
                ⏱️ {readingTime} min de leitura
              </span>
            </div>
          </div>

          <h1 
            className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
            dangerouslySetInnerHTML={{ __html: conteudo.titulo }}
          />

          {/* Metadata */}
          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 pb-6 border-b border-slate-200 dark:border-slate-800">
            {conteudo.created_at && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Criado em {new Date(conteudo.created_at).toLocaleDateString('pt-BR')}
              </div>
            )}
            {conteudo.updated_at && conteudo.updated_at !== conteudo.created_at && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizado em {new Date(conteudo.updated_at).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div 
              className="prose prose-slate dark:prose-invert max-w-none p-8 lg:p-12
                prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-p:text-slate-700 dark:prose-p:text-slate-300
                prose-p:leading-relaxed prose-p:text-lg
                prose-a:text-blue-600 dark:prose-a:text-blue-400
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-code:bg-slate-100 dark:prose-code:bg-slate-800
                prose-code:text-slate-900 dark:prose-code:text-slate-100
                prose-code:px-2 prose-code:py-1 prose-code:rounded
                prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800
                prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700
                prose-blockquote:border-l-blue-500
                prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
                prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                prose-ul:text-slate-700 dark:prose-ul:text-slate-300
                prose-ol:text-slate-700 dark:prose-ol:text-slate-300
                prose-li:text-slate-700 dark:prose-li:text-slate-300"
              dangerouslySetInnerHTML={{ __html: conteudo.corpo }}
            />
          </div>
        </motion.article>

        {/* Navigation Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mt-8 pt-8 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <Link
              href="/dashboard/conteudo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 order-2 sm:order-1 w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar para Biblioteca
            </Link>
            
            {canEdit && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 order-1 sm:order-2"
              >
                <span className="text-sm text-slate-500 dark:text-slate-400 hidden lg:block font-medium">
                  Gerenciar conteúdo:
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link
                    href={`/dashboard/conteudo/editar/${conteudo.id}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 text-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-105 flex-1 sm:flex-initial"
                    title="Editar este conteúdo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="hidden sm:inline">Editar</span>
                    <span className="sm:hidden">Editar conteúdo</span>
                  </Link>
                  <button
                    onClick={onDelete}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 text-sm border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 hover:scale-105 flex-1 sm:flex-initial"
                    title="Excluir este conteúdo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">Excluir</span>
                    <span className="sm:hidden">Excluir conteúdo</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VisualizarConteudoPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const { loading, error, conteudo, isProfessor, isDesenvolvedor, handleDelete } = useConteudo(resolvedParams.id);

  if (loading) return <LoadingSpinner />;
  if (error || !conteudo) return <ConteudoNaoEncontrado />;

  return (
    <ConteudoView 
      conteudo={conteudo} 
      isProfessor={isProfessor}
      isDesenvolvedor={isDesenvolvedor}
      onDelete={handleDelete}
    />
  );
} 