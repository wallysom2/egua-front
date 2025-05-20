"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Conteudo {
  id: number;
  titulo: string;
  corpo: string;
  nivel_leitura: "basico" | "intermediario";
  linguagem_id: number;
}

export default function ConteudoPage() {
  const router = useRouter();
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfessor, setIsProfessor] = useState(false);
  const [isDesenvolvedor, setIsDesenvolvedor] = useState(false);

  useEffect(() => {
    const checkUserType = () => {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setIsProfessor(userData.tipo === "professor");
        setIsDesenvolvedor(userData.tipo === "desenvolvedor");
      }
    };

    const fetchConteudos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/conteudos`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Erro ao carregar conteúdos: ${response.status}`);
        }

        const data = await response.json();
        setConteudos(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar conteúdos. Tente novamente mais tarde.";
        setError(errorMessage);
        console.error("Erro detalhado:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUserType();
    fetchConteudos();
  }, [router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este conteúdo?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/conteudos/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir conteúdo");
      }

      setConteudos(conteudos.filter((conteudo) => conteudo.id !== id));
    } catch (err) {
      setError("Erro ao excluir conteúdo. Tente novamente mais tarde.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard de Conteúdos</h1>
            <p className="text-slate-600 mt-1">Gerencie seus conteúdos educacionais</p>
          </div>
          {isProfessor || isDesenvolvedor ? (
            <Link
              href="/dashboard/conteudo/novo"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Novo Conteúdo
            </Link>
          ) : null}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {conteudos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Total de Conteúdos</h3>
                <p className="text-3xl font-bold text-blue-600">{conteudos.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Nível Básico</h3>
                <p className="text-3xl font-bold text-green-600">
                  {conteudos.filter(c => c.nivel_leitura === "basico").length}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Nível Intermediário</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {conteudos.filter(c => c.nivel_leitura === "intermediario").length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conteudos.map((conteudo) => (
                <div
                  key={conteudo.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-bold mb-2">{conteudo.titulo}</h2>
                  <p className="text-slate-600 mb-4 line-clamp-3">{conteudo.corpo}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      conteudo.nivel_leitura === "basico" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-purple-100 text-purple-600"
                    }`}>
                      {conteudo.nivel_leitura}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/conteudo/${conteudo.id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      >
                        Ver
                      </Link>
                      {isProfessor || isDesenvolvedor ? (
                        <>
                          <Link
                            href={`/dashboard/conteudo/editar/${conteudo.id}`}
                            className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(conteudo.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            Excluir
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Nenhum conteúdo encontrado</h2>
              <p className="text-slate-600 mb-6">Comece criando seu primeiro conteúdo educacional</p>
              {isProfessor || isDesenvolvedor ? (
                <Link
                  href="/dashboard/conteudo/novo"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Primeiro Conteúdo
                </Link>
              ) : (
                <p className="text-slate-600">Entre em contato com um professor ou desenvolvedor para ter acesso aos conteúdos.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 