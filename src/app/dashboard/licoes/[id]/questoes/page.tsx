"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Questao {
  id: number;
  conteudo_id: number;
  enunciado: string;
  nivel: "facil" | "medio" | "dificil";
  exemplo_resposta: string | null;
  opcoes: string[] | null;
  resposta_correta: string | null;
  tipo: "multipla_escolha" | "verdadeiro_falso" | "programacao";
}

interface Conteudo {
  id: number;
  titulo: string;
  tipo: "pratico" | "quiz";
  linguagem_id?: number;
  licao_id?: number;
}

const getTipoQuestaoLabel = (tipo: string) => {
  switch (tipo) {
    case "multipla_escolha":
      return "Múltipla Escolha";
    case "verdadeiro_falso":
      return "Verdadeiro/Falso";
    case "programacao":
      return "Programação";
    default:
      return tipo;
  }
};

const getNivelLabel = (nivel: string) => {
  switch (nivel) {
    case "facil":
      return "Fácil";
    case "medio":
      return "Médio";
    case "dificil":
      return "Difícil";
    default:
      return nivel;
  }
};

export default function Questoes({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [exercicio, setExercicio] = useState<Conteudo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Buscando conteúdo ID:", resolvedParams.id);
    

        // Busca todas as questões disponíveis
        const questoesUrl = `${API_URL}/questoes`;
        console.log("Buscando todas as questões em:", questoesUrl);
        
        const questoesResponse = await fetch(questoesUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Resposta questões:", questoesResponse.status);

        if (questoesResponse.ok) {
          const todasQuestoes = await questoesResponse.json();
          console.log("Todas as questões:", todasQuestoes);
          
          // Filtra questões relacionadas ao conteúdo atual
          const questoesFiltradas = Array.isArray(todasQuestoes) 
            ? todasQuestoes.filter(questao => 
                questao.conteudo_id === parseInt(resolvedParams.id) || 
                questao.exercicio_id === parseInt(resolvedParams.id)
              )
            : [];
          
          console.log("Questões filtradas:", questoesFiltradas);
          setQuestoes(questoesFiltradas);
        } else {
          console.warn("Não foi possível carregar questões, status:", questoesResponse.status);
          setQuestoes([]);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError(error instanceof Error ? error.message : "Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, router]);

  const handleDeleteQuestao = async (questaoId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta questão?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/questoes/${questaoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setQuestoes(questoes.filter((q) => q.id !== questaoId));
      } else {
        throw new Error("Erro ao excluir questão");
      }
    } catch (error) {
      console.error("Erro ao excluir questão:", error);
      alert("Erro ao excluir questão. Tente novamente.");
    }
  };

  const handleEditQuestao = (questaoId: number) => {
    router.push(`/dashboard/licoes/${resolvedParams.id}/questoes/${questaoId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold text-white">Carregando...</p>
      </div>
    );
  }

  if (error || !exercicio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <p className="text-xl font-semibold text-red-400 mb-4">{error || "Conteúdo não encontrado"}</p>
        <button
          onClick={() => router.push("/dashboard/licoes")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para Lições
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400 mb-2">Questões - {exercicio.titulo}</h1>
            <p className="text-slate-300 text-lg">
              Gerencie as questões deste conteúdo
            </p>
          </div>
          <Link
            href={`/dashboard/licoes/${resolvedParams.id}/questoes/nova`}
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
            <span>Nova Questão</span>
          </Link>
        </div>

        <div className="space-y-4">
          {questoes.map((questao) => (
            <div
              key={questao.id}
              className="bg-slate-900 rounded-xl p-6 shadow-md hover:bg-slate-800 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      questao.tipo === "multipla_escolha"
                        ? "bg-purple-900 text-purple-300"
                        : questao.tipo === "verdadeiro_falso"
                        ? "bg-green-900 text-green-300"
                        : "bg-blue-900 text-blue-300"
                    }`}
                  >
                    {getTipoQuestaoLabel(questao.tipo)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      questao.nivel === "facil"
                        ? "bg-green-900 text-green-300"
                        : questao.nivel === "medio"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {getNivelLabel(questao.nivel)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditQuestao(questao.id)}
                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Editar questão"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteQuestao(questao.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    title="Excluir questão"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-white font-semibold mb-1">Enunciado:</h3>
                  <p className="text-slate-300">{questao.enunciado}</p>
                </div>

                {questao.exemplo_resposta && (
                  <div>
                    <h4 className="text-white font-semibold mb-1">Exemplo de Resposta:</h4>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <pre className="text-slate-300 text-sm whitespace-pre-wrap">{questao.exemplo_resposta}</pre>
                    </div>
                  </div>
                )}

                {questao.opcoes && questao.opcoes.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Opções:</h4>
                    <div className="space-y-1">
                      {questao.opcoes.map((opcao, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-lg text-sm ${
                            questao.resposta_correta === opcao
                              ? "bg-green-900 text-green-300 border border-green-700"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + index)})</span> {opcao}
                          {questao.resposta_correta === opcao && (
                            <span className="ml-2 text-green-400">✓ Correta</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {questao.resposta_correta && !questao.opcoes && (
                  <div>
                    <h4 className="text-white font-semibold mb-1">Resposta Correta:</h4>
                    <div className="bg-green-900 border border-green-700 rounded-lg p-3">
                      <p className="text-green-300 text-sm">{questao.resposta_correta}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {questoes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">Nenhuma questão cadastrada ainda.</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push("/dashboard/licoes")}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Voltar para Lições
          </button>
        </div>
      </div>
    </div>
  );
} 