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
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Carregando...</p>
      </motion.div>
    </div>
  );
}

function ConteudoNaoEncontrado() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header Simplificado */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link 
              href="/dashboard" 
              className="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Égua
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="text-4xl mb-4">📄</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Conteúdo não encontrado</h1>
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
  isProfessor, 
  isDesenvolvedor, 
  onDelete 
}: { 
  conteudo: Conteudo; 
  isProfessor: boolean;
  isDesenvolvedor: boolean;
  onDelete: () => void;
}) {
  const readingTime = estimateReadingTime(conteudo.corpo);
  const canEdit = isProfessor || isDesenvolvedor;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header Limpo */}
      <div className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Égua
              </Link>
              <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
                <span>/</span>
                <Link href="/dashboard/conteudo" className="hover:text-slate-900 dark:hover:text-white transition-colors">Conteúdo</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Cabeçalho do Artigo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                conteudo.nivel_leitura === "basico"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              }`}
            >
              {conteudo.nivel_leitura === "basico" ? "Básico" : "Intermediário"}
            </span>
            {conteudo.linguagem && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                {conteudo.linguagem.nome}
              </span>
            )}
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm">
              {readingTime} min
            </span>
          </div>

          {/* Título */}
          <h1 
            className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight"
            dangerouslySetInnerHTML={{ __html: conteudo.titulo }}
          />

          {/* Metadata */}
          {conteudo.created_at && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Criado em {new Date(conteudo.created_at).toLocaleDateString('pt-BR')}
            </p>
          )}
        </motion.div>

        {/* Conteúdo do Artigo */}
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div 
            className="prose prose-slate dark:prose-invert max-w-none
              prose-headings:text-slate-900 dark:prose-headings:text-white
              prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-p:leading-relaxed
              prose-a:text-blue-600 dark:prose-a:text-blue-400
              prose-strong:text-slate-900 dark:prose-strong:text-white
              prose-code:bg-slate-100 dark:prose-code:bg-slate-800
              prose-code:text-slate-900 dark:prose-code:text-slate-100
              prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800
              prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700
              prose-blockquote:border-l-blue-500
              prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
              prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r
              prose-ul:text-slate-700 dark:prose-ul:text-slate-300
              prose-ol:text-slate-700 dark:prose-ol:text-slate-300
              prose-li:text-slate-700 dark:prose-li:text-slate-300"
            dangerouslySetInnerHTML={{ __html: conteudo.corpo }}
          />
        </motion.article>

        {/* Navegação */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-8 border-t border-slate-200 dark:border-slate-700 flex justify-end"
        >
          <Link
            href="/dashboard/conteudo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            ← Voltar
          </Link>
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