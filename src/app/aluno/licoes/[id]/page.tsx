'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';
import {
  processarExercicio,
  processarQuestoesDoEndpoint,
} from '@/utils/exercicioProcessors';
import { type Exercicio, type Questao } from '@/types/exercicio';
import { ExercicioProgramacao } from '@/app/dashboard/licoes/[id]/components';
import { motion } from 'framer-motion';
import { Loading } from '@/components/Loading';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  nome: string;
  tipo: 'aluno' | 'professor' | 'desenvolvedor';
  email?: string;
  cpf?: string;
  id?: string | number;
}

// Componente simples para questões de quiz (adaptado para alunos)
function QuestaoQuizSimples({
  questao,
  respostaSelecionada,
  onRespostaChange,
  exercicioFinalizado,
}: {
  questao: Questao;
  respostaSelecionada?: string;
  onRespostaChange: (questaoId: number, resposta: string) => void;
  exercicioFinalizado: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {questao.opcoes?.map((opcao, index) => {
          const isSelected = respostaSelecionada === opcao.id;
          const isCorrect = questao.resposta_correta === opcao.id;
          const isIncorrect = exercicioFinalizado && isSelected && !isCorrect;

          return (
            <button
              key={opcao.id}
              onClick={() =>
                !exercicioFinalizado && onRespostaChange(questao.id, opcao.id)
              }
              disabled={exercicioFinalizado}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all text-lg font-medium ${exercicioFinalizado
                ? isCorrect
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : isIncorrect
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                : isSelected
                  ? 'bg-blue-100 border-blue-500 text-blue-800'
                  : 'bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-300'
                } ${exercicioFinalizado ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${exercicioFinalizado
                    ? isCorrect
                      ? 'border-green-500 bg-green-500 text-white'
                      : isIncorrect
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-gray-300 bg-gray-100'
                    : isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                    }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{opcao.texto}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Componente simples para questões de texto livre (adaptado para alunos)
function QuestaoTextoSimples({
  questao,
  resposta,
  onRespostaChange,
  exercicioFinalizado,
}: {
  questao: Questao;
  resposta?: string;
  onRespostaChange: (questaoId: number, resposta: string) => void;
  exercicioFinalizado: boolean;
}) {
  return (
    <div className="space-y-4">
      <textarea
        value={resposta || ''}
        onChange={(e) => onRespostaChange(questao.id, e.target.value)}
        disabled={exercicioFinalizado}
        placeholder="Digite sua resposta aqui..."
        className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none min-h-[150px] resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default function ExercicioAlunoDetalhes({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [exercicio, setExercicio] = useState<Exercicio | null>(null);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercicioFinalizado, setExercicioFinalizado] = useState(false);
  const [resultados, setResultados] = useState<{
    acertos: number;
    total: number;
  } | null>(null);
  const [mostrarRetorno, setMostrarRetorno] = useState(false);
  const [exercicioConcluido, setExercicioConcluido] = useState(false);

  const resolvedParams = use(params);

  useEffect(() => {
    // Aguardar auth carregar
    if (authLoading) return;

    // Se não autenticado, redirecionar
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Verificar se é aluno
    if (user && user.tipo !== 'aluno') {
      router.push('/dashboard');
      return;
    }

    const fetchExercicio = async () => {
      try {
        // Buscar exercício
        const exercicioData = await apiClient.get<Record<string, unknown>>(`/exercicios/${resolvedParams.id}`);
        const exercicioProcessado = processarExercicio(exercicioData);

        // Se não há questões no exercício processado, tentar buscar separadamente
        if (exercicioProcessado.questoes.length === 0) {
          try {
            const questoesData = await apiClient.get<Record<string, unknown>[]>(`/exercicios/${resolvedParams.id}/questoes`);
            const questoesProcessadas = processarQuestoesDoEndpoint(
              questoesData,
              parseInt(resolvedParams.id),
            );
            exercicioProcessado.questoes = questoesProcessadas;
          } catch {
            // Última tentativa: buscar todas as questões e filtrar
            try {
              const todasQuestoes = await apiClient.get<Record<string, unknown>[]>('/questoes');
              if (Array.isArray(todasQuestoes)) {
                const questoesFiltradas = todasQuestoes.filter(
                  (q) =>
                    q.conteudo_id === parseInt(resolvedParams.id) ||
                    q.exercicio_id === parseInt(resolvedParams.id),
                );
                exercicioProcessado.questoes = processarQuestoesDoEndpoint(
                  questoesFiltradas,
                  parseInt(resolvedParams.id),
                );
              }
            } catch (error) {
              console.error('Erro ao buscar todas as questões:', error);
            }
          }
        }

        // Buscar nome da linguagem se necessário
        if (
          exercicioProcessado.linguagem_id &&
          !exercicioProcessado.nome_linguagem
        ) {
          try {
            const langData = await apiClient.get<{ nome: string }>(`/linguagens/${exercicioProcessado.linguagem_id}`);
            exercicioProcessado.nome_linguagem = langData.nome;
          } catch {
            exercicioProcessado.nome_linguagem = 'Senior Code AI';
          }
        }

        setExercicio(exercicioProcessado);
      } catch (error: unknown) {
        console.error('Erro ao carregar exercício:', error);
        setError('Não foi possível carregar o exercício.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercicio();
  }, [resolvedParams.id, router, isAuthenticated, authLoading, user]);

  const questaoAtualData = exercicio?.questoes[questaoAtual];
  const totalQuestoes = exercicio?.questoes.length || 0;

  const handleRespostaChange = (questaoId: number, resposta: string) => {
    if (exercicioFinalizado) return;
    setRespostas((prev) => ({ ...prev, [questaoId]: resposta }));
  };

  const proximaQuestao = () => {
    if (questaoAtual < totalQuestoes - 1) {
      setQuestaoAtual((prev) => prev + 1);
    }
  };

  const questaoAnterior = () => {
    if (questaoAtual > 0) {
      setQuestaoAtual((prev) => prev - 1);
    }
  };

  const finalizarExercicio = async () => {
    let acertos = 0;
    const totalQuestoes = exercicio?.questoes.length || 0;

    exercicio?.questoes.forEach((questao) => {
      if (
        questao.resposta_correta &&
        respostas[questao.id] === questao.resposta_correta
      ) {
        acertos++;
      }
    });

    const pontuacao = (acertos / totalQuestoes) * 100;
    const exercicioCompleto = pontuacao >= 70; // Considera aprovado com 70% ou mais

    setResultados({ acertos, total: totalQuestoes });
    setExercicioFinalizado(true);
    setMostrarRetorno(true);

    try {
      // Se o exercício foi aprovado, salvar no banco
      if (exercicioCompleto) {
        // Primeiro, verificar se o exercício já foi iniciado
        const statusData = await apiClient.get<{ status: string; progresso?: { id: string } }>(`/user-exercicio/status/${resolvedParams.id}`);

        let userExercicioId: string | null = null;

        if (statusData.status === 'nao_iniciado') {
          // Iniciar o exercício
          const iniciarData = await apiClient.post<{ id: string }>('/user-exercicio/iniciar', {
            exercicio_id: parseInt(resolvedParams.id),
          });
          userExercicioId = iniciarData.id;
        } else if (statusData.progresso) {
          userExercicioId = statusData.progresso.id;
        }

        // Se temos um userExercicioId, finalizar o exercício
        if (userExercicioId) {
          await apiClient.patch(`/user-exercicio/${userExercicioId}/finalizar`);
          console.log('Exercício finalizado com sucesso no banco de dados');
          setExercicioConcluido(true);
        }
      }

      // Mostrar retorno por 5 segundos e depois redirecionar
      setTimeout(() => {
        setMostrarRetorno(false);
        router.push('/aluno');
      }, 5000);
    } catch (error) {
      console.error('Erro ao finalizar exercício:', error);
    }
  };

  const renderResposta = () => {
    if (!questaoAtualData || !exercicio) return null;

    // Para questões de programação, mostrar o editor de código
    if (
      questaoAtualData.tipo === 'programacao' ||
      questaoAtualData.tipo === 'codigo'
    ) {
      return (
        <ExercicioProgramacao
          questao={questaoAtualData}
          codigoExemplo={exercicio.codigo_exemplo}
          exercicioFinalizado={exercicioFinalizado}
          userId={user?.id}
          exercicioId={resolvedParams.id}
        />
      );
    }

    // Para questões de quiz com opções - usar componente simplificado
    if (
      (questaoAtualData.tipo === 'quiz' ||
        questaoAtualData.tipo === 'multipla_escolha') &&
      questaoAtualData.opcoes &&
      questaoAtualData.opcoes.length > 0
    ) {
      return (
        <QuestaoQuizSimples
          questao={questaoAtualData}
          respostaSelecionada={respostas[questaoAtualData.id]}
          onRespostaChange={handleRespostaChange}
          exercicioFinalizado={exercicioFinalizado}
        />
      );
    }

    // Para questões de texto livre - usar componente simplificado
    return (
      <QuestaoTextoSimples
        questao={questaoAtualData}
        resposta={respostas[questaoAtualData.id]}
        onRespostaChange={handleRespostaChange}
        exercicioFinalizado={exercicioFinalizado}
      />
    );
  };

  if (loading) {
    return <Loading text="Carregando sua lição..." size="lg" />;
  }

  if (error || !exercicio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6">😞</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Não foi possível carregar
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
            {error || 'Exercício não encontrado'}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              🔄 Tentar Novamente
            </button>
            <button
              onClick={() => router.push('/aluno')}
              className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-lg font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Header Fixo - Mesmo da página inicial */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full z-40 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm"
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <div className="flex items-center gap-3">
                <Image
                  src="/hu.png"
                  alt="Senior Code AI Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Senior Code AI
                  </h1>
                  <p className="text-base text-slate-600 dark:text-slate-400">
                    Olá, {user?.nome?.split(' ')[0] || 'Aluno'}!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Controle de Volta */}
            <Link
              href="/aluno"
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-lg font-medium"
            >
              ← Voltar
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <main className="flex-1 py-20 pt-36">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Título da Lição - Mesmo estilo da página inicial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {exercicio?.titulo}
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Questão {questaoAtual + 1} de {totalQuestoes}
              </p>
            </motion.div>

            {/* Questão */}
            {questaoAtualData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 p-8 shadow-lg mb-8"
              >
                <div className="mb-8">
                  <div className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: questaoAtualData.enunciado,
                      }}
                    />
                  </div>
                </div>

                {/* Área de Resposta */}
                <div>{renderResposta()}</div>
              </motion.div>
            )}

            {/* Navegação */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 p-8 shadow-lg"
            >
              <div className="flex justify-between items-center gap-8">
                {/* Botão Anterior */}
                <button
                  onClick={questaoAnterior}
                  disabled={questaoAtual === 0}
                  className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-xl font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 max-w-xs"
                >
                  ← Anterior
                </button>

                {/* Contador Central */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900 dark:text-white">
                    {questaoAtual + 1}
                  </div>
                  <div className="text-xl text-slate-600 dark:text-slate-400">
                    de {totalQuestoes}
                  </div>
                </div>

                {/* Botão Próximo ou Finalizar */}
                {questaoAtual === totalQuestoes - 1 ? (
                  <button
                    onClick={finalizarExercicio}
                    disabled={exercicioFinalizado}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 max-w-xs"
                  >
                    ✅ Finalizar
                  </button>
                ) : (
                  <button
                    onClick={proximaQuestao}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors flex-1 max-w-xs"
                  >
                    Próxima →
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Retorno em Tela */}
      {mostrarRetorno && resultados && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 p-6 shadow-2xl max-w-sm"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">
              {resultados.acertos === resultados.total ? '🏆' : '👏'}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {resultados.acertos === resultados.total
                ? 'Parabéns!'
                : 'Bom trabalho!'}
            </h3>

            <div className="text-lg text-slate-700 dark:text-slate-300 mb-4">
              Você acertou{' '}
              <span className="font-bold text-green-600">
                {resultados.acertos}
              </span>{' '}
              de <span className="font-bold">{resultados.total}</span> questões
            </div>

            {exercicioConcluido && (
              <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-600 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <span className="text-lg">✅</span>
                  <span className="font-semibold">Exercício concluído!</span>
                </div>
              </div>
            )}

            <div className="text-sm text-slate-500 dark:text-slate-400">
              Voltando em alguns segundos...
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
