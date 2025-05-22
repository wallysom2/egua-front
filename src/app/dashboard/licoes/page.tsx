"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Exercicio {
  id: number;
  titulo: string;
  tipo: "pratico" | "quiz";
  linguagem_id: number;
}

interface UserExercicio {
  id: string;
  exercicio_id: number;
  status: "em_andamento" | "concluido";
  finalizado_em: string | null;
}


export default function Licoes() {
  const router = useRouter();
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [linguagensMap, setLinguagensMap] = useState<Map<number, string>>(new Map());
  const [userExercicios, setUserExercicios] = useState<UserExercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteExercicio = async (exercicioId: number) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/exercicios/${exercicioId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setExercicios(exercicios.filter(ex => ex.id !== exercicioId));
      } else {
        throw new Error('Erro ao excluir exercício');
      }
    } catch (error) {
      console.error('Erro ao excluir exercício:', error);
      alert('Erro ao excluir exercício. Tente novamente.');
    }
  };

  const handleEditExercicio = (exercicioId: number) => {
    router.push(`/dashboard/licoes/editar/${exercicioId}`);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Tenta buscar os dados da API
        const [exerciciosResponse, linguagensResponse] = await Promise.allSettled([
          fetch(`${API_URL}/exercicios`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/linguagens`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ]);

        // Atualiza exercícios se a requisição foi bem sucedida
        if (exerciciosResponse.status === 'fulfilled' && exerciciosResponse.value.ok) {
          const data = await exerciciosResponse.value.json();
          if (Array.isArray(data) && data.length > 0) {
            setExercicios(data);
          }
        }

        // Atualiza linguagens se a requisição foi bem sucedida
        if (linguagensResponse.status === 'fulfilled' && linguagensResponse.value.ok) {
          const data = await linguagensResponse.value.json();
          const map = new Map<number, string>();
          if (Array.isArray(data) && data.length > 0) {
            data.forEach((lang: { id: number; nome: string }) =>
              map.set(lang.id, lang.nome)
            );
            setLinguagensMap(map);
          }
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Mantém os dados mockados em caso de erro
        setError("Não foi possível carregar os dados. Usando dados de exemplo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getStatusExercicio = (exercicioId: number) => {
    const userExercicio = userExercicios.find(
      (ue: UserExercicio) => ue.exercicio_id === exercicioId
    );
    return userExercicio?.status || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold text-white">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <p className="text-xl font-semibold text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400 mb-2">Lições</h1>
            <p className="text-slate-300 text-lg">
              Pratique seus conhecimentos com exercícios práticos e quizzes
            </p>
          </div>
          <Link
            href="/dashboard/licoes/criar/exercicio"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Criar Exercício</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercicios.map((exercicio: Exercicio) => {
            const status = getStatusExercicio(exercicio.id);
            return (
              <div
                key={exercicio.id}
                className="bg-slate-900 rounded-xl p-6 shadow-md hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      exercicio.tipo === "pratico"
                        ? "bg-blue-900 text-blue-300"
                        : "bg-purple-900 text-purple-300"
                    }`}
                  >
                    {exercicio.tipo === "pratico" ? "Prático" : "Quiz"}
                  </span>
                  <div className="flex gap-2">
                    {status && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          status === "concluido"
                            ? "bg-green-900 text-green-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {status === "concluido" ? "Concluído" : "Em andamento"}
                      </span>
                    )}
                    <button
                      onClick={() => handleEditExercicio(exercicio.id)}
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Editar exercício"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteExercicio(exercicio.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      title="Excluir exercício"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-2 text-white">{exercicio.titulo}</h2>
                <p className="text-slate-400 mb-4">
                  Linguagem: {linguagensMap.get(exercicio.linguagem_id) || "..."}
                </p>

                <div className="flex gap-4">
                  <Link
                    href={`/dashboard/licoes/${exercicio.id}`}
                    className="flex-1 text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all font-medium"
                  >
                    {status === "concluido"
                      ? "Revisar Exercício"
                      : status === "em_andamento"
                      ? "Continuar Exercício"
                      : "Iniciar Exercício"}
                  </Link>
                  <Link
                    href={`/dashboard/licoes/${exercicio.id}/questoes`}
                    className="px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center"
                    title="Gerenciar questões"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 