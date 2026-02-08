'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import {
  processarExercicio,
  processarQuestoesDoEndpoint,
} from '@/utils/exercicioProcessors';
import { type Exercicio } from '@/types/exercicio';
import {
  QuestaoQuiz,
  ExercicioProgramacao,
  QuestaoTextoLivre,
  NavegacaoQuestoes,
  PainelQuestao,
} from './components';

export default function ExercicioDetalhes({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Determinar URL de retorno baseado de onde o usuário veio
  const fromTurma = searchParams.get('from') === 'turma';
  const turmaId = searchParams.get('turmaId');
  const licaoId = searchParams.get('licaoId');
  const returnUrl = fromTurma && turmaId ? `/dashboard/turma/${turmaId}` : '/dashboard/licoes';
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
  const [mostrarModalResultados, setMostrarModalResultados] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [respostaId, setRespostaId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (authLoading || !isAuthenticated || !loading) {
      return;
    }

    const fetchExercicio = async () => {
      let exercicioProcessado;
      try {
        // Buscar exercício
        const exercicioData = await apiClient.get(`/exercicios/${resolvedParams.id}`);


        // Processar exercício usando o novo sistema
        exercicioProcessado = processarExercicio(exercicioData);

        // Se não há questões no exercício processado, tentar buscar separadamente


        // Buscar questões do exercício separadamente
        try {
          const questoesData = await apiClient.get(`/exercicios/${resolvedParams.id}/questoes`);
          const questoesProcessadas = processarQuestoesDoEndpoint(
            Array.isArray(questoesData) ? questoesData : [],
            parseInt(resolvedParams.id),
          );
          exercicioProcessado.questoes = questoesProcessadas;
        } catch (questoesError) {
          console.warn('Erro ao buscar questões:', questoesError);

          // Última tentativa: buscar todas as questões e filtrar
          try {
            const todasQuestoes = await apiClient.get('/questoes');

            if (Array.isArray(todasQuestoes)) {
              const questoesFiltradas = todasQuestoes.filter(
                (q: any) =>
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

        // Buscar nome da linguagem se necessário
        if (
          exercicioProcessado.linguagem_id &&
          !exercicioProcessado.nome_linguagem
        ) {
          try {
            const langData = await apiClient.get(`/linguagens/${exercicioProcessado.linguagem_id}`);
            exercicioProcessado.nome_linguagem = (langData as any)?.nome || 'Senior Code AI';
          } catch {
            exercicioProcessado.nome_linguagem = 'Senior Code AI';
          }
        }

        setExercicio(exercicioProcessado);
      } catch (error: unknown) {
        console.error('Erro ao carregar exercício:', error);
        setError(
          'Não foi possível carregar o exercício. Tente novamente mais tarde.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExercicio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id, isAuthenticated, authLoading]);

  const questaoAtualData = exercicio?.questoes[questaoAtual];
  const totalQuestoes = exercicio?.questoes.length || 0;
  const respostasPreenchidas = new Set(
    Object.keys(respostas)
      .map(
        (id) =>
          exercicio?.questoes.findIndex((q) => q.id === parseInt(id)) || -1,
      )
      .filter((index) => index !== -1),
  );

  const handleRespostaChange = (questaoId: number, resposta: string) => {
    if (exercicioFinalizado) return;

    setRespostas((prev) => ({
      ...prev,
      [questaoId]: resposta,
    }));
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

  const mudarQuestao = (indice: number) => {
    if (indice >= 0 && indice < totalQuestoes) {
      setQuestaoAtual(indice);
    }
  };

  const finalizarExercicio = async () => {
    // Calcular resultados antes de finalizar
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

    const pontuacao = totalQuestoes > 0 ? (acertos / totalQuestoes) * 100 : 100;

    setResultados({ acertos, total: totalQuestoes });
    setExercicioFinalizado(true);
    setMostrarModalResultados(true);

    try {
      // Se veio da trilha, registrar progresso na trilha da turma
      if (fromTurma && turmaId && licaoId) {
        await apiClient.post(`/turmas/${turmaId}/progresso/${licaoId}`, {
          completado: true,
          pontuacao: pontuacao,
        });
      } else {
        // Caso contrário, usar o endpoint padrão de exercícios
        await apiClient.post(`/exercicios/${resolvedParams.id}/submit`, {
          respostas: exercicio?.tipo === 'pratico' ? {} : respostas,
          pontuacao: pontuacao,
        });
      }

      // Exercício finalizado com sucesso
      setTimeout(() => {
        router.push(returnUrl);
      }, 4000);
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
          onRespostaSubmitida={setRespostaId}
        />
      );
    }

    // Para questões de quiz com opções
    if (
      (questaoAtualData.tipo === 'quiz' ||
        questaoAtualData.tipo === 'multipla_escolha') &&
      questaoAtualData.opcoes &&
      questaoAtualData.opcoes.length > 0
    ) {
      return (
        <QuestaoQuiz
          questao={questaoAtualData}
          respostaSelecionada={respostas[questaoAtualData.id]}
          onRespostaChange={handleRespostaChange}
          exercicioFinalizado={exercicioFinalizado || !!respostas[questaoAtualData.id]}
          mostrarResultado={exercicioFinalizado || !!respostas[questaoAtualData.id]}
        />
      );
    }

    // Para questões de texto livre
    return (
      <QuestaoTextoLivre
        questao={questaoAtualData}
        resposta={respostas[questaoAtualData.id]}
        onRespostaChange={handleRespostaChange}
        exercicioFinalizado={exercicioFinalizado}
      />
    );
  };

  if (loading) {
    return <Loading text="Carregando exercício..." />;
  }

  if (error || !exercicio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Oops! Algo deu errado
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error ||
              'Não foi possível encontrar este exercício. Ele pode ter sido removido ou você não tem permissão para acessá-lo.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Tentar Novamente
            </button>
            <button
              onClick={() => router.push(returnUrl)}
              className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Navbar Simplificada */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Navegação */}
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-slate-900 dark:text-white hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/hu.png"
                  alt="Senior Code AI"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
                <span className="font-semibold text-lg">Senior Code AI</span>
              </Link>

              {/* Breadcrumb */}

            </div>

            {/* Ações */}
            <div className="flex items-center space-x-3">

              <BackButton href={returnUrl} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da Lição */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Indicador de Progresso */}
          {totalQuestoes > 1 && (
            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>Questão {questaoAtual + 1} de {totalQuestoes}</span>
                <span>{Math.round(((questaoAtual + 1) / totalQuestoes) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((questaoAtual + 1) / totalQuestoes) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Layout Principal - Grid Responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Painel da Questão */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24"
            >
              <PainelQuestao
                exercicio={exercicio}
                questao={questaoAtualData}
                questaoAtual={questaoAtual}
                totalQuestoes={totalQuestoes}
                respostaId={respostaId}
              />
            </motion.div>
          </div>

          {/* Área de Resposta */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 lg:p-8">
                {renderResposta()}
              </div>

              {/* Navegação */}
              <div className="border-t border-slate-200 dark:border-slate-800">
                <NavegacaoQuestoes
                  questaoAtual={questaoAtual}
                  totalQuestoes={totalQuestoes}
                  respostasPreenchidas={respostasPreenchidas}
                  onMudarQuestao={mudarQuestao}
                  onProximaQuestao={proximaQuestao}
                  onQuestaoAnterior={questaoAnterior}
                />
              </div>

              {/* Botão de Finalizar */}
              {questaoAtual === totalQuestoes - 1 && !exercicioFinalizado && (
                <div className="border-t border-slate-200 dark:border-slate-800 p-6 lg:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
                  <button
                    onClick={finalizarExercicio}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                  >
                    Finalizar Exercício
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modal de Resultados */}
      {mostrarModalResultados && resultados && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setMostrarModalResultados(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Status Visual */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
                <div className="text-4xl">
                  {resultados.acertos === resultados.total
                    ? '🏆'
                    : resultados.acertos >= resultados.total * 0.7
                      ? '🎉'
                      : '💪'}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Exercício Concluído!
              </h2>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {resultados.acertos === resultados.total
                  ? 'Perfeito! Você dominou o conteúdo!'
                  : resultados.acertos >= resultados.total * 0.7
                    ? 'Muito bem! Bom aproveitamento!'
                    : 'Continue praticando, você está no caminho certo!'}
              </p>

              {exercicio?.tipo === 'quiz' && (
                <div className="mb-8">
                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {resultados.total}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {resultados.acertos}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Acertos
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                        {Math.round((resultados.acertos / resultados.total) * 100)}%
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Aproveitamento
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-6">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(resultados.acertos / resultados.total) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className={`h-2 rounded-full ${resultados.acertos === resultados.total
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : resultados.acertos >= resultados.total * 0.7
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : 'bg-gradient-to-r from-slate-400 to-slate-500'
                          }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setMostrarModalResultados(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Revisar
                </button>
                <button
                  onClick={() => router.push(returnUrl)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continuar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Ícone de Aviso */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <div className="w-8 h-8 text-red-600 dark:text-red-400">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Excluir Exercício
              </h2>

              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                Esta ação não pode ser desfeita. O exercício e todas as questões relacionadas serão removidos permanentemente.
              </p>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Implementar lógica de exclusão aqui
                    setShowDeleteModal(false);
                    router.push(returnUrl);
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
