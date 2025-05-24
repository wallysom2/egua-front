"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  const checkUserType = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setIsProfessor(userData.tipo === "professor");
      setIsDesenvolvedor(userData.tipo === "desenvolvedor");
    }
  };

  const fetchConteudo = async () => {
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
  };

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
  }, [id]);

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
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-xl font-semibold text-white">Carregando conteúdo...</p>
        <p className="text-slate-400 mt-2">Preparando a melhor experiência de leitura para você</p>
      </div>
    </div>
  );
}

function ConteudoNaoEncontrado() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <span>›</span>
          <Link href="/dashboard/conteudo" className="hover:text-white transition-colors">Conteúdo</Link>
          <span>›</span>
          <span className="text-white">Não encontrado</span>
        </nav>

        <div className="text-center py-16 bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800/50">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold text-white mb-4">Conteúdo não encontrado</h1>
          <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
            O conteúdo que você está procurando não existe ou foi removido.
          </p>
          <Link
            href="/dashboard/conteudo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Voltar para Biblioteca
          </Link>
        </div>
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <span>›</span>
          <Link href="/dashboard/conteudo" className="hover:text-white transition-colors">Conteúdo</Link>
          <span>›</span>
          <span className="text-white line-clamp-1">{conteudo.titulo}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">
                {conteudo.nivel_leitura === "basico" ? "🌱" : "🚀"}
              </div>
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    conteudo.nivel_leitura === "basico"
                      ? "bg-green-900/50 text-green-300 border border-green-700/50"
                      : "bg-purple-900/50 text-purple-300 border border-purple-700/50"
                  }`}
                >
                  {conteudo.nivel_leitura === "basico" ? "📚 Nível Básico" : "🎯 Nível Intermediário"}
                </span>
                {conteudo.linguagem && (
                  <span className="px-4 py-2 bg-blue-900/50 text-blue-300 border border-blue-700/50 rounded-full text-sm font-medium">
                    🔤 {conteudo.linguagem.nome}
                  </span>
                )}
              </div>
            </div>
            
            <h1 
              className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
              dangerouslySetInnerHTML={{ __html: conteudo.titulo }}
            />
            
            <div className="flex flex-wrap items-center gap-6 text-slate-400">
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <span>{readingTime} min de leitura</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📖</span>
                <span>Conteúdo educacional</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/conteudo"
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              ← Voltar
            </Link>
            {canEdit && (
              <>
                <Link
                  href={`/dashboard/conteudo/editar/${conteudo.id}`}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-yellow-400 transition-colors flex items-center gap-2"
                >
                  ✏️ Editar
                </Link>
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2"
                >
                  🗑️ Excluir
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <article className="bg-slate-900/50 backdrop-blur rounded-xl p-8 lg:p-12 border border-slate-800/50 shadow-2xl">
            <div className="prose prose-lg prose-invert max-w-none">
              <div 
                className="text-slate-200 leading-relaxed space-y-6 content-article"
                dangerouslySetInnerHTML={{ __html: conteudo.corpo }} 
              />
            </div>
          </article>

          {/* Footer Actions */}
          <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 p-6 bg-slate-900/30 backdrop-blur rounded-xl border border-slate-800/30">
            <div className="text-center sm:text-left">
              <p className="text-slate-300 font-medium">Gostou do conteúdo?</p>
              <p className="text-slate-400 text-sm">Continue explorando nossa biblioteca de conhecimento</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/conteudo"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                📚 Ver mais conteúdos
              </Link>
              <Link
                href="/dashboard/licoes"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
              >
                🎯 Fazer exercícios
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .content-article h1 {
          @apply text-3xl font-bold text-white mb-6 mt-8 first:mt-0;
        }
        .content-article h2 {
          @apply text-2xl font-bold text-blue-300 mb-4 mt-6;
        }
        .content-article h3 {
          @apply text-xl font-bold text-green-300 mb-3 mt-5;
        }
        .content-article p {
          @apply text-slate-200 leading-relaxed mb-4;
        }
        .content-article ul, .content-article ol {
          @apply text-slate-200 mb-4 pl-6;
        }
        .content-article li {
          @apply mb-2;
        }
        .content-article code {
          @apply bg-slate-800 text-yellow-300 px-2 py-1 rounded text-sm;
        }
        .content-article pre {
          @apply bg-slate-800 text-green-300 p-4 rounded-lg overflow-x-auto my-6;
        }
        .content-article blockquote {
          @apply border-l-4 border-blue-500 pl-4 italic text-slate-300 my-6;
        }
        .content-article a {
          @apply text-blue-400 hover:text-blue-300 underline;
        }
        .content-article strong {
          @apply font-bold text-white;
        }
        .content-article em {
          @apply italic text-slate-300;
        }
      `}</style>
    </div>
  );
}

export default function VisualizarConteudoPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const { loading, error, conteudo, isProfessor, isDesenvolvedor, handleDelete } = useConteudo(resolvedParams.id);

  if (loading) return <LoadingSpinner />;
  if (!conteudo) return <ConteudoNaoEncontrado />;

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-900/90 backdrop-blur border border-red-700 text-red-200 px-6 py-4 rounded-lg shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium">Erro</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
      <ConteudoView 
        conteudo={conteudo} 
        isProfessor={isProfessor}
        isDesenvolvedor={isDesenvolvedor}
        onDelete={handleDelete} 
      />
    </>
  );
} 