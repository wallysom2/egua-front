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

// Dados mockados
const exerciciosMockados: Exercicio[] = [
  {
    id: 1,
    titulo: "Introdução à Programação",
    tipo: "pratico",
    linguagem_id: 1
  },
  {
    id: 2,
    titulo: "Variáveis e Tipos de Dados",
    tipo: "quiz",
    linguagem_id: 1
  },
  {
    id: 3,
    titulo: "Estruturas de Controle",
    tipo: "pratico",
    linguagem_id: 2
  }
];

const userExerciciosMockados: UserExercicio[] = [
  {
    id: "1",
    exercicio_id: 1,
    status: "concluido",
    finalizado_em: "2024-03-20T10:00:00Z"
  },
  {
    id: "2",
    exercicio_id: 2,
    status: "em_andamento",
    finalizado_em: null
  }
];

const linguagensMockadas = new Map([
  [1, "Python"],
  [2, "JavaScript"]
]);

export default function Licoes() {
  const router = useRouter();
  const [exercicios, setExercicios] = useState<Exercicio[]>(exerciciosMockados);
  const [userExercicios, setUserExercicios] = useState<UserExercicio[]>(userExerciciosMockados);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linguagensMap, setLinguagensMap] = useState<Map<number, string>>(linguagensMockadas);

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
      (ue) => ue.exercicio_id === exercicioId
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
            href="/dashboard/licoes/criar"
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
          {exercicios.map((exercicio) => {
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
                </div>

                <h2 className="text-xl font-bold mb-2 text-white">{exercicio.titulo}</h2>
                <p className="text-slate-400 mb-4">
                  Linguagem: {linguagensMap.get(exercicio.linguagem_id) || "..."}
                </p>

                <Link
                  href={`/dashboard/licoes/${exercicio.id}`}
                  className="block w-full text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all font-medium"
                >
                  {status === "concluido"
                    ? "Revisar Exercício"
                    : status === "em_andamento"
                    ? "Continuar Exercício"
                    : "Iniciar Exercício"}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 