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
}

interface PageParams {
  id: string;
}

function useConteudo(id: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conteudo, setConteudo] = useState<Conteudo | null>(null);
  const [isProfessor, setIsProfessor] = useState(false);
  const router = useRouter();

  const checkUserType = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setIsProfessor(userData.tipo === "professor");
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
        throw new Error("Erro ao carregar conteúdo");
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
    if (!confirm("Tem certeza que deseja excluir este conteúdo?")) return;

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
    handleDelete
  };
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function ConteudoNaoEncontrado() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Conteúdo não encontrado
        </div>
      </div>
    </div>
  );
}

function ConteudoView({ conteudo, isProfessor, onDelete }: { 
  conteudo: Conteudo; 
  isProfessor: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{conteudo.titulo}</h1>
          <div className="flex items-center gap-4 text-slate-600">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-sm">
              {conteudo.nivel_leitura === "basico" ? "Básico" : "Intermediário"}
            </span>
            {conteudo.linguagem && (
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                {conteudo.linguagem.nome}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard/conteudo"
            className="px-4 py-2 text-slate-600 hover:text-slate-800"
          >
            Voltar
          </Link>
          {isProfessor && (
            <>
              <Link
                href={`/dashboard/conteudo/editar/${conteudo.id}`}
                className="px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                Editar
              </Link>
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      <div className="prose prose-slate max-w-none">
        <div 
          className="text-slate-700 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: conteudo.corpo }} 
        />
      </div>
    </div>
  );
}

export default function VisualizarConteudoPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const { loading, error, conteudo, isProfessor, handleDelete } = useConteudo(resolvedParams.id);

  if (loading) return <LoadingSpinner />;
  if (!conteudo) return <ConteudoNaoEncontrado />;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <ConteudoView 
          conteudo={conteudo} 
          isProfessor={isProfessor} 
          onDelete={handleDelete} 
        />
      </div>
    </div>
  );
} 