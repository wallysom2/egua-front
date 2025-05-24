"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Opcao {
  id: string;
  texto: string;
}

interface Questao {
  id: number;
  enunciado: string;
  nivel: "facil" | "medio" | "dificil";
  tipo: "multipla_escolha" | "verdadeiro_falso" | "codigo";
  opcoes?: Opcao[];
  resposta_correta?: string;
  exemplo_resposta?: string;
  ordem: number;
}

interface Exercicio {
  id: number;
  titulo: string;
  tipo: "pratico" | "quiz";
  linguagem_id: number;
  nome_linguagem?: string;
  codigo_exemplo?: string;
  questoes: Questao[];
}

export default function ExercicioDetalhes({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [exercicio, setExercicio] = useState<Exercicio | null>(null);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<{ [key: number]: string }>({});
  const [codigo, setCodigo] = useState('');
  const [resultadoExecucao, setResultadoExecucao] = useState('');
  const [executando, setExecutando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercicioFinalizado, setExercicioFinalizado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchExercicio = async () => {
      try {
        // Buscar exercício
        const exercicioResponse = await fetch(`${API_URL}/exercicios/${resolvedParams.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!exercicioResponse.ok) {
          throw new Error(`Erro ao carregar exercício: ${exercicioResponse.status}`);
        }

        const exercicioData = await exercicioResponse.json();

        // Buscar questões do exercício
        const questoesResponse = await fetch(`${API_URL}/exercicios/${resolvedParams.id}/questoes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        let questoesData = [];
        if (questoesResponse.ok) {
          questoesData = await questoesResponse.json();
          questoesData.sort((a: Questao, b: Questao) => a.ordem - b.ordem);
        }

        // Buscar nome da linguagem se necessário
        if (exercicioData.linguagem_id && !exercicioData.nome_linguagem) {
          try {
            const langResponse = await fetch(`${API_URL}/linguagens/${exercicioData.linguagem_id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });
            if (langResponse.ok) {
              const langData = await langResponse.json();
              exercicioData.nome_linguagem = langData.nome;
            } else {
              exercicioData.nome_linguagem = "Égua";
            }
          } catch {
            exercicioData.nome_linguagem = "Égua";
          }
        }

        setExercicio({
          ...exercicioData,
          questoes: questoesData
        });

        // Inicializar código se for exercício prático
        if (exercicioData.tipo === "pratico" && exercicioData.codigo_exemplo) {
          setCodigo(exercicioData.codigo_exemplo);
        }

      } catch (error: unknown) {
        console.error("Erro ao carregar exercício:", error);
        setError("Não foi possível carregar o exercício. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchExercicio();
  }, [resolvedParams.id, router]);

  const questaoAtualData = exercicio?.questoes[questaoAtual];
  const totalQuestoes = exercicio?.questoes.length || 0;
  const questoesRespondidas = Object.keys(respostas).length;

  const executarCodigo = async () => {
    setExecutando(true);
    setResultadoExecucao('');
    
    try {
      // Simular execução do código Égua
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (codigo.includes('escreva(')) {
        const match = codigo.match(/escreva\("([^"]+)"\)/);
        if (match) {
          setResultadoExecucao(match[1]);
        } else {
          setResultadoExecucao('Olá, Mundo!');
        }
      } else {
        setResultadoExecucao('Código executado com sucesso!');
      }
    } catch (error) {
      console.error("Erro ao executar código:", error);
      setResultadoExecucao('Erro ao executar o código');
    } finally {
      setExecutando(false);
    }
  };

  const handleRespostaChange = (questaoId: number, resposta: string) => {
    if (exercicioFinalizado) return;
    
    setRespostas(prev => ({
      ...prev,
      [questaoId]: resposta
    }));
  };

  const proximaQuestao = () => {
    if (questaoAtual < totalQuestoes - 1) {
      setQuestaoAtual(prev => prev + 1);
    }
  };

  const questaoAnterior = () => {
    if (questaoAtual > 0) {
      setQuestaoAtual(prev => prev - 1);
    }
  };

  const finalizarExercicio = async () => {
    setExercicioFinalizado(true);
    
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/exercicios/${resolvedParams.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          respostas: exercicio?.tipo === "pratico" ? { codigo } : respostas 
        }),
      });

      if (response.ok) {
        // Exercício finalizado com sucesso
        setTimeout(() => {
          router.push("/dashboard/licoes");
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao finalizar exercício:", error);
    }
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
        <p className="text-xl font-semibold text-red-400 mb-4">{error || "Exercício não encontrado"}</p>
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
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {exercicio.tipo === "pratico" ? "💻" : "🧩"} {exercicio.titulo}
            </h1>
            <p className="text-slate-400 text-lg">
              {questoesRespondidas} de {totalQuestoes} questões respondidas
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
              ☀️ Claro
            </button>
            <Link
              href="/dashboard/licoes"
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              ← Voltar
            </Link>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Material da Lição */}
          <div className="bg-slate-900 rounded-xl p-6">
            <div className="border-l-4 border-blue-500 pl-4 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Material da Lição</h2>
            </div>

            {questaoAtualData ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg font-semibold text-white">
                    Questão {questaoAtual + 1} de {totalQuestoes}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      questaoAtualData.nivel === "facil"
                        ? "bg-green-900/50 text-green-300 border border-green-700"
                        : questaoAtualData.nivel === "medio"
                        ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                        : "bg-red-900/50 text-red-300 border border-red-700"
                    }`}
                  >
                    {questaoAtualData.nivel.charAt(0).toUpperCase() + questaoAtualData.nivel.slice(1)}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    📝 Enunciado da Questão
                  </h3>
                  <div className="text-slate-300 bg-slate-800 p-4 rounded-lg">
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {questaoAtualData.enunciado}
                    </p>
                  </div>
                </div>

                {questaoAtualData.exemplo_resposta && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">💡 Exemplo de Resposta:</h4>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <pre className="text-yellow-300 font-mono text-sm overflow-x-auto">
                        {questaoAtualData.exemplo_resposta}
                      </pre>
                    </div>
                  </div>
                )}

                {exercicio.codigo_exemplo && exercicio.tipo === "pratico" && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">📋 Código de Exemplo:</h4>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <pre className="text-yellow-300 font-mono text-sm overflow-x-auto">
                        {exercicio.codigo_exemplo}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Navegação entre questões */}
                <div className="flex justify-between pt-4 border-t border-slate-700">
                  <button
                    onClick={questaoAnterior}
                    disabled={questaoAtual === 0}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={proximaQuestao}
                    disabled={questaoAtual === totalQuestoes - 1}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">Nenhuma questão encontrada para este exercício.</p>
              </div>
            )}
          </div>

          {/* Área de Execução/Resposta */}
          <div className="bg-slate-900 rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                {exercicio.tipo === "pratico" ? "💻 Área de Programação" : "📝 Sua Resposta"}
              </h2>
              <p className="text-slate-400">
                {exercicio.tipo === "pratico" 
                  ? "Digite seu código e execute para ver o resultado"
                  : "Selecione a resposta correta"}
              </p>
            </div>

            <div className="space-y-4">
              {questaoAtualData && exercicio.tipo === "quiz" && questaoAtualData.opcoes ? (
                // Quiz - Múltipla escolha
                <div className="space-y-3">
                  {questaoAtualData.opcoes.map((opcao) => (
                    <label
                      key={opcao.id}
                      className="flex items-center p-4 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={`questao-${questaoAtualData.id}`}
                        value={opcao.id}
                        checked={respostas[questaoAtualData.id] === opcao.id}
                        onChange={(e) => handleRespostaChange(questaoAtualData.id, e.target.value)}
                        disabled={exercicioFinalizado}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600"
                      />
                      <span className="text-slate-300">{opcao.texto}</span>
                    </label>
                  ))}
                </div>
              ) : exercicio.tipo === "pratico" ? (
                // Prático - Editor de código
                <>
                  <div>
                    <label className="block text-slate-300 mb-2 font-medium">
                      Digite seu código aqui...
                    </label>
                    <textarea
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder={questaoAtualData?.exemplo_resposta || 'escreva("Olá, Mundo!");'}
                      disabled={exercicioFinalizado}
                    />
                  </div>

                  <button
                    onClick={executarCodigo}
                    disabled={executando || !codigo.trim() || exercicioFinalizado}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {executando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Executando...
                      </>
                    ) : (
                      '▶️ Executar Código'
                    )}
                  </button>

                  {resultadoExecucao && (
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">📤 Resultado:</h4>
                      <div className="bg-black rounded p-3 font-mono text-green-400">
                        {resultadoExecucao}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Resposta em texto livre
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">
                    Digite sua resposta...
                  </label>
                  <textarea
                    value={questaoAtualData ? (respostas[questaoAtualData.id] || "") : ""}
                    onChange={(e) => questaoAtualData && handleRespostaChange(questaoAtualData.id, e.target.value)}
                    className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Digite sua resposta aqui..."
                    disabled={exercicioFinalizado}
                  />
                </div>
              )}

              {/* Botão de finalizar */}
              {questaoAtual === totalQuestoes - 1 && !exercicioFinalizado && (
                <button
                  onClick={finalizarExercicio}
                  className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  ✅ Finalizar Exercício
                </button>
              )}

              {exercicioFinalizado && (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
                  <p className="text-green-300 font-medium">
                    ✅ Exercício finalizado com sucesso!
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Redirecionando para a lista de lições...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 