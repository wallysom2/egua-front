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

        if (exerciciosResponse.status === 'fulfilled' && exerciciosResponse.value.ok) {
          const data = await exerciciosResponse.value.json();
          if (Array.isArray(data) && data.length > 0) {
            setExercicios(data);
          }
        }

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

  const exerciciosCompletos = userExercicios.filter(ue => ue.status === "concluido").length;
  const totalExercicios = exercicios.length;

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
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              🎓 Lições de Programação
            </h1>
            <p className="text-slate-400 text-lg">
              {exerciciosCompletos} de {totalExercicios} exercícios completos
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
              ☀️ Claro
            </button>
            <Link
              href="/dashboard/licoes/criar/exercicio"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              ➕ Criar Exercício
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-slate-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Progresso Geral</h3>
            <span className="text-blue-400 font-medium">
              {totalExercicios > 0 ? Math.round((exerciciosCompletos / totalExercicios) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${totalExercicios > 0 ? (exerciciosCompletos / totalExercicios) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Exercícios Grid */}
        {exercicios.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-xl">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-white mb-2">Nenhum exercício encontrado</h3>
            <p className="text-slate-400 mb-6">Comece criando seu primeiro exercício de programação!</p>
            <Link
              href="/dashboard/licoes/criar/exercicio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Criar Primeiro Exercício
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {exercicios.map((exercicio: Exercicio) => {
              const status = getStatusExercicio(exercicio.id);
              const isCompleted = status === "concluido";
              const isInProgress = status === "em_andamento";
              
              return (
                <div
                  key={exercicio.id}
                  className="bg-slate-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:bg-slate-800 border border-slate-800 hover:border-slate-700"
                >
                  {/* Header do Card */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {exercicio.tipo === "pratico" ? "💻" : "🧩"}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          exercicio.tipo === "pratico"
                            ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                            : "bg-purple-900/50 text-purple-300 border border-purple-700"
                        }`}
                      >
                        {exercicio.tipo === "pratico" ? "Prático" : "Quiz"}
                      </span>
                    </div>
                    
                    {/* Status Badge */}
                    {status && (
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        isCompleted
                          ? "bg-green-900/50 text-green-300 border border-green-700"
                          : "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                      }`}>
                        {isCompleted ? "✅" : "⏳"}
                        {isCompleted ? "Concluído" : "Em andamento"}
                      </div>
                    )}
                  </div>

                  {/* Título e Descrição */}
                  <h2 className="text-xl font-bold mb-3 text-white leading-tight">
                    {exercicio.titulo}
                  </h2>
                  <div className="flex items-center gap-2 mb-6 text-slate-400">
                    <span className="text-sm">🔤</span>
                    <span className="text-sm">
                      {linguagensMap.get(exercicio.linguagem_id) || "Carregando..."}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/dashboard/licoes/${exercicio.id}`}
                      className="flex-1 text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all font-medium transform hover:scale-105"
                    >
                      {isCompleted
                        ? "📖 Revisar"
                        : isInProgress
                        ? "▶️ Continuar"
                        : "🚀 Iniciar"}
                    </Link>
                    
                    {/* Menu de Ações */}
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/licoes/${exercicio.id}/questoes`}
                        className="p-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
                        title="Gerenciar questões"
                      >
                        ❓
                      </Link>
                      <button
                        onClick={() => handleEditExercicio(exercicio.id)}
                        className="p-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-blue-400 transition-colors"
                        title="Editar exercício"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteExercicio(exercicio.id)}
                        className="p-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                        title="Excluir exercício"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 