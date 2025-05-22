"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Questao {
  id: number;
  enunciado: string;
  nivel: "facil" | "medio" | "dificil";
}

interface Exercicio {
  id: number;
  titulo: string;
  tipo: "pratico" | "quiz";
  linguagem_id: number;
  nome_linguagem?: string;
  exercicio_questao: {
    questao: Questao;
    ordem: number;
  }[];
}

export default function ExercicioDetalhes({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [exercicio, setExercicio] = useState<Exercicio | null>(null);
  const [respostas, setRespostas] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchExercicio = async () => {
      try {
        const response = await fetch(`${API_URL}/exercicios/${resolvedParams.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        if (!response.ok) {
          throw new Error(`Erro ao carregar exercício: ${response.status}`);
        }
        const data = await response.json();

        if (data && data.linguagem_id && !data.nome_linguagem) {
          try {
            const langResponse = await fetch(
              `${API_URL}/linguagens/${data.linguagem_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
              }
            );
            if (langResponse.ok) {
              const langData = await langResponse.json();
              data.nome_linguagem = langData.nome;
            } else {
              console.warn(
                `Não foi possível carregar o nome da linguagem ID: ${data.linguagem_id}`
              );
              data.nome_linguagem = "Desconhecida";
            }
          } catch (langError) {
            console.error(
              "Erro ao carregar nome da linguagem:",
              langError
            );
            data.nome_linguagem = "Erro ao carregar";
          }
        }
        setExercicio(data);
      } catch (error) {
        console.error("Erro ao carregar exercício:", error);
        setError("Não foi possível carregar o exercício. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchExercicio();
  }, [resolvedParams.id, router]);

  const handleRespostaChange = (questaoId: number, resposta: string) => {
    setRespostas((prev) => ({
      ...prev,
      [questaoId]: resposta,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/exercicios/${resolvedParams.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ respostas }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar respostas: ${response.status}`);
      }

      router.push("/dashboard/licoes");
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      setError("Não foi possível enviar suas respostas. Tente novamente mais tarde.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-xl font-semibold text-red-600 mb-4">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
          <Link
            href="/dashboard/licoes"
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Voltar para Lições
          </Link>
        </div>
      </div>
    );
  }

  if (!exercicio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-xl font-semibold text-red-600">
          Exercício não encontrado
        </p>
        <Link
          href="/dashboard/licoes"
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Voltar para Lições
        </Link>
      </div>
    );
  }

  const questao = exercicio.exercicio_questao[questaoAtual]?.questao;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {exercicio.titulo}
              </h1>
              <p className="text-slate-600">
                Linguagem: {exercicio.nome_linguagem || exercicio.linguagem_id}
              </p>
            </div>
            <Link
              href="/dashboard/licoes"
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Voltar
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  exercicio.tipo === "pratico"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {exercicio.tipo === "pratico" ? "Prático" : "Quiz"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  questao.nivel === "facil"
                    ? "bg-green-100 text-green-800"
                    : questao.nivel === "medio"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {questao.nivel.charAt(0).toUpperCase() + questao.nivel.slice(1)}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Questão {questaoAtual + 1}</h2>
              <p className="text-slate-700 whitespace-pre-wrap">
                {questao.enunciado}
              </p>
            </div>

            <div className="mb-6">
              <textarea
                value={respostas[questao.id] || ""}
                onChange={(e) => handleRespostaChange(questao.id, e.target.value)}
                className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Digite sua resposta aqui..."
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setQuestaoAtual((prev) => Math.max(0, prev - 1))}
                disabled={questaoAtual === 0}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {questaoAtual === exercicio.exercicio_questao.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Enviando..." : "Finalizar Exercício"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    setQuestaoAtual((prev) =>
                      Math.min(exercicio.exercicio_questao.length - 1, prev + 1)
                    )
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Próxima
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 