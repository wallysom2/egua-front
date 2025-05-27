"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Opcao {
  id: string;
  texto: string;
}

interface Questao {
  id: number;
  conteudo_id?: number;
  enunciado: string;
  nivel: "facil" | "medio" | "dificil";
  tipo: "multipla_escolha" | "verdadeiro_falso" | "codigo" | "quiz";
  opcoes?: Opcao[];
  resposta_correta?: string;
  exemplo_resposta?: string | null;
  ordem?: number;
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

  // Função para processar e normalizar questões da API
  const processarQuestoes = (questoes: any[]): Questao[] => {
    console.log("Processando questões:", questoes);
    return questoes.map((questao, index) => {
      const questaoProcessada = {
        id: questao.id,
        conteudo_id: questao.conteudo_id,
        enunciado: questao.enunciado,
        nivel: questao.nivel,
        tipo: questao.tipo,
        opcoes: questao.opcoes || [],
        resposta_correta: questao.resposta_correta,
        exemplo_resposta: questao.exemplo_resposta,
        ordem: questao.ordem !== undefined ? questao.ordem : index
      };
      console.log(`Questão ${index + 1} processada:`, questaoProcessada);
      return questaoProcessada;
    });
  };

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
        const questoesResponse = await fetch(`${API_URL}/questoes/${resolvedParams.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        let questoesData = [];
        if (questoesResponse.ok) {
          const responseData = await questoesResponse.json();
          console.log("Questões recebidas da API:", responseData);
          
          // Se a resposta for um array, usar diretamente
          if (Array.isArray(responseData)) {
            questoesData = responseData;
          } 
          // Se a resposta for um objeto com uma propriedade que contém as questões
          else if (responseData.questoes && Array.isArray(responseData.questoes)) {
            questoesData = responseData.questoes;
          }
          // Se a resposta for uma única questão, colocar em um array
          else if (responseData.id) {
            questoesData = [responseData];
          }
          
          questoesData.sort((a: Questao, b: Questao) => (a.ordem || 0) - (b.ordem || 0));
        } else {
          console.warn("Erro ao buscar questões:", questoesResponse.status);
          // Tentar buscar todas as questões e filtrar
          try {
            const todasQuestoesResponse = await fetch(`${API_URL}/questoes`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });
            
            if (todasQuestoesResponse.ok) {
              const todasQuestoes = await todasQuestoesResponse.json();
              console.log("Todas as questões:", todasQuestoes);
              
              if (Array.isArray(todasQuestoes)) {
                questoesData = todasQuestoes.filter(q => 
                  q.conteudo_id === parseInt(resolvedParams.id) || 
                  q.exercicio_id === parseInt(resolvedParams.id)
                );
              }
            }
          } catch (error) {
            console.error("Erro ao buscar todas as questões:", error);
          }
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
          questoes: processarQuestoes(questoesData)
        });

        console.log("Exercício final configurado:", {
          ...exercicioData,
          questoes: processarQuestoes(questoesData)
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

  // Debug: log da questão atual
  if (questaoAtualData) {
    console.log("Questão atual:", questaoAtualData);
    console.log("Tipo do exercício:", exercicio?.tipo);
    console.log("Tipo da questão:", questaoAtualData.tipo);
    console.log("Opções:", questaoAtualData.opcoes);
  }

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 hover:scale-105 transition-transform"
              >
                🏛️ <span>Égua</span>
              </Link>
              <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
                <span>›</span>
                <Link href="/dashboard/licoes" className="hover:text-slate-900 dark:hover:text-white transition-colors">Lições</Link>
                <span>›</span>
                <span className="text-slate-900 dark:text-white font-medium">{exercicio.titulo}</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/dashboard/licoes"
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                ← Voltar
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Layout responsivo melhorado */}
        <div className="flex flex-col xl:flex-row gap-6 h-full">
          {/* Painel da questão */}
          <div className="xl:w-1/2 space-y-6">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800 shadow-xl">
              {questaoAtualData ? (
                <div className="p-6">
                  {/* Cabeçalho da questão */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-white">
                        Questão {questaoAtual + 1}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                      {exercicio.tipo === "pratico" ? "Prático" : "Quiz"}
                    </span>
                  </div>

                  {/* Enunciado */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      📋 Enunciado
                    </h3>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {questaoAtualData.enunciado}
                      </p>
                    </div>
                  </div>

                  {/* Exemplo de resposta */}
                  {questaoAtualData.exemplo_resposta && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        💡 Exemplo de Resposta
                      </h4>
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <pre className="text-yellow-300 font-mono text-sm overflow-x-auto">
                          {questaoAtualData.exemplo_resposta}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Código de exemplo */}
                  {exercicio.codigo_exemplo && exercicio.tipo === "pratico" && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        📋 Código de Exemplo
                      </h4>
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <pre className="text-yellow-300 font-mono text-sm overflow-x-auto">
                          {exercicio.codigo_exemplo}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="text-slate-400 py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <p>Nenhuma questão encontrada para este exercício.</p>
                    <p className="text-sm mt-2">ID do exercício: {resolvedParams.id}</p>
                    <p className="text-sm">Tipo do exercício: {exercicio.tipo}</p>
                    <p className="text-sm">Total de questões carregadas: {totalQuestoes}</p>
                  </div>
                </div>
              )}

              {/* Navegação entre questões */}
              {totalQuestoes > 1 && (
                <div className="border-t border-slate-800 p-4">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={questaoAnterior}
                      disabled={questaoAtual === 0}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      ← Anterior
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalQuestoes }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setQuestaoAtual(i)}
                          className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                            i === questaoAtual
                              ? "bg-blue-600 text-white"
                              : respostas[exercicio.questoes[i]?.id]
                              ? "bg-green-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={proximaQuestao}
                      disabled={questaoAtual === totalQuestoes - 1}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Próxima →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Painel de resposta */}
          <div className="xl:w-1/2">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800 shadow-xl h-full">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    {exercicio.tipo === "pratico" ? "💻 Área de Programação" : "📝 Sua Resposta"}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {exercicio.tipo === "pratico" 
                      ? "Digite seu código e execute para ver o resultado"
                      : "Selecione a resposta correta"}
                  </p>
                </div>

                <div className="space-y-4">
                  {questaoAtualData && (
                    exercicio.tipo === "quiz" || 
                    questaoAtualData.tipo === "quiz" || 
                    questaoAtualData.tipo === "multipla_escolha"
                  ) && questaoAtualData.opcoes && questaoAtualData.opcoes.length > 0 ? (
                    // Quiz - Múltipla escolha
                    <div className="space-y-3">
                      {questaoAtualData.opcoes.map((opcao, index) => (
                        <label
                          key={opcao.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                            respostas[questaoAtualData.id] === opcao.id
                              ? "bg-blue-900/30 border-blue-500 text-blue-100"
                              : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                              respostas[questaoAtualData.id] === opcao.id
                                ? "border-blue-500 bg-blue-500"
                                : "border-slate-500"
                            }`}>
                              {respostas[questaoAtualData.id] === opcao.id && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="font-medium mr-3 text-slate-400">
                              {String.fromCharCode(65 + index)}.
                            </span>
                          </div>
                          <span className="flex-1">{opcao.texto}</span>
                          <input
                            type="radio"
                            name={`questao-${questaoAtualData.id}`}
                            value={opcao.id}
                            checked={respostas[questaoAtualData.id] === opcao.id}
                            onChange={(e) => handleRespostaChange(questaoAtualData.id, e.target.value)}
                            disabled={exercicioFinalizado}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                  ) : exercicio.tipo === "pratico" ? (
                    // Prático - Editor de código
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 mb-3 font-medium">
                          💻 Editor de Código
                        </label>
                        <div className="relative">
                          <textarea
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder={questaoAtualData?.exemplo_resposta || 'escreva("Olá, Mundo!");'}
                            disabled={exercicioFinalizado}
                          />
                          <div className="absolute top-2 right-2 text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                            Égua
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={executarCodigo}
                        disabled={executando || !codigo.trim() || exercicioFinalizado}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                      >
                        {executando ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Executando...
                          </>
                        ) : (
                          <>
                            ▶️ Executar Código
                          </>
                        )}
                      </button>

                      {resultadoExecucao && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            📤 Resultado da Execução
                          </h4>
                          <div className="bg-black/50 border border-slate-600 rounded p-4 font-mono text-green-400 text-sm">
                            {resultadoExecucao}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Resposta em texto livre
                    <div>
                      <label className="block text-slate-300 mb-3 font-medium">
                        ✍️ Digite sua resposta
                      </label>
                      <textarea
                        value={questaoAtualData ? (respostas[questaoAtualData.id] || "") : ""}
                        onChange={(e) => questaoAtualData && handleRespostaChange(questaoAtualData.id, e.target.value)}
                        className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Digite sua resposta aqui..."
                        disabled={exercicioFinalizado}
                      />
                    </div>
                  )}

                  {/* Botão de finalizar */}
                  {questaoAtual === totalQuestoes - 1 && !exercicioFinalizado && (
                    <button
                      onClick={finalizarExercicio}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      ✅ Finalizar Exercício
                    </button>
                  )}

                  {exercicioFinalizado && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-3">🎉</div>
                      <p className="text-green-300 font-medium text-lg mb-2">
                        Exercício finalizado com sucesso!
                      </p>
                      <p className="text-slate-400 text-sm">
                        Redirecionando para a lista de lições...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 