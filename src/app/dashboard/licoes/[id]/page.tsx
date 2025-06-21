'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  nome: string;
  tipo: 'aluno' | 'professor' | 'desenvolvedor';
  email?: string;
  cpf?: string;
  id?: string | number;
}

export default function ExercicioDetalhes({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [exercicio, setExercicio] = useState<Exercicio | null>(null);
  const [user, setUser] = useState<User | null>(null);
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Carregar dados do usuário
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
      }
    }

    const fetchExercicio = async () => {
      try {
        // Buscar exercício
        const exercicioResponse = await fetch(
          `${API_URL}/exercicios/${resolvedParams.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!exercicioResponse.ok) {
          throw new Error(
            `Erro ao carregar exercício: ${exercicioResponse.status}`,
          );
        }

        const exercicioData = await exercicioResponse.json();
        console.log('Dados do exercício recebidos:', exercicioData);

        // Processar exercício usando o novo sistema
        const exercicioProcessado = processarExercicio(exercicioData);

        // Se não há questões no exercício processado, tentar buscar separadamente
        if (exercicioProcessado.questoes.length === 0) {
          console.log(
            'Nenhuma questão encontrada no exercício, buscando separadamente...',
          );

          // Buscar questões do exercício separadamente
          const questoesResponse = await fetch(
            `${API_URL}/exercicios/${resolvedParams.id}/questoes`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          if (questoesResponse.ok) {
            const questoesData = await questoesResponse.json();
            const questoesProcessadas = processarQuestoesDoEndpoint(
              questoesData,
              parseInt(resolvedParams.id),
            );
            exercicioProcessado.questoes = questoesProcessadas;
          } else {
            console.warn('Erro ao buscar questões:', questoesResponse.status);

            // Última tentativa: buscar todas as questões e filtrar
            try {
              const todasQuestoesResponse = await fetch(`${API_URL}/questoes`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (todasQuestoesResponse.ok) {
                const todasQuestoes = await todasQuestoesResponse.json();
                console.log('Todas as questões:', todasQuestoes);

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
            const langResponse = await fetch(
              `${API_URL}/linguagens/${exercicioProcessado.linguagem_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              },
            );
            if (langResponse.ok) {
              const langData = await langResponse.json();
              exercicioProcessado.nome_linguagem = langData.nome;
            } else {
              exercicioProcessado.nome_linguagem = 'Senior Code AI';
            }
          } catch {
            exercicioProcessado.nome_linguagem = 'Senior Code AI';
          }
        }

        setExercicio(exercicioProcessado);
        console.log('Exercício final configurado:', exercicioProcessado);
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
  }, [resolvedParams.id, router]);

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

    setResultados({ acertos, total: totalQuestoes });
    setExercicioFinalizado(true);
    setMostrarModalResultados(true);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${API_URL}/exercicios/${resolvedParams.id}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            respostas: exercicio?.tipo === 'pratico' ? {} : respostas,
            pontuacao: (acertos / totalQuestoes) * 100,
          }),
        },
      );

      if (response.ok) {
        // Exercício finalizado com sucesso
        setTimeout(() => {
          router.push('/dashboard/licoes');
        }, 4000);
      }
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
          exercicioFinalizado={exercicioFinalizado}
          mostrarResultado={exercicioFinalizado}
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Carregando exercício...
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Preparando sua experiência de aprendizado
          </p>
        </div>
      </div>
    );
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
              onClick={() => router.push('/dashboard/licoes')}
              className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              ← Voltar para Lições
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Navbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/dashboard"
                className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <Image
                  src="/hu.png"
                  alt="Senior Code AI Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span>Senior Code AI</span>
              </Link>
            </motion.div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link
                  href="/dashboard"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <span>›</span>
                <Link
                  href="/dashboard/licoes"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Lições
                </Link>
                <span>›</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {exercicio.titulo}
                </span>
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

      {/* Conteúdo Principal */}
      <main className="flex-1 py-16 pt-32">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Cabeçalho da Lição */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {exercicio?.titulo || 'Carregando...'}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Exercício prático de programação
                  </p>
                </div>
                {user?.tipo === 'professor' && (
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/licoes/editar/${resolvedParams.id}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Descrição da Tarefa - Full Width no Topo */}
            <div className="mb-6">
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <PainelQuestao
                  exercicio={exercicio}
                  questao={questaoAtualData}
                  questaoAtual={questaoAtual}
                  totalQuestoes={totalQuestoes}
                />
              </div>
            </div>

            {/* Área de Execução e Feedback */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="p-6">{renderResposta()}</div>

              <NavegacaoQuestoes
                questaoAtual={questaoAtual}
                totalQuestoes={totalQuestoes}
                respostasPreenchidas={respostasPreenchidas}
                onMudarQuestao={mudarQuestao}
                onProximaQuestao={proximaQuestao}
                onQuestaoAnterior={questaoAnterior}
              />

              {/* Botão de finalizar */}
              {questaoAtual === totalQuestoes - 1 && !exercicioFinalizado && (
                <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                  <button
                    onClick={finalizarExercicio}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                  >
                    Finalizar Exercício
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Resultados */}
      {mostrarModalResultados && resultados && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setMostrarModalResultados(false)}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">
                {resultados.acertos === resultados.total
                  ? '🏆'
                  : resultados.acertos >= resultados.total * 0.7
                  ? '🎉'
                  : '👍'}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Exercício Finalizado!
              </h2>

              {exercicio?.tipo === 'quiz' && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4 text-center mb-6 max-w-xs mx-auto">
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {resultados.acertos}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                        Acertos
                      </div>
                    </div>
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl">
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {resultados.total - resultados.acertos}
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                        Erros
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (resultados.acertos / resultados.total) * 100
                          }%`,
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-3 rounded-full ${
                          resultados.acertos === resultados.total
                            ? 'bg-green-500'
                            : resultados.acertos >= resultados.total * 0.7
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>

                  <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
                    {resultados.acertos === resultados.total
                      ? '🌟 Perfeito! Você acertou todas as questões!'
                      : resultados.acertos >= resultados.total * 0.7
                      ? '🎯 Muito bem! Bom aproveitamento!'
                      : '💪 Continue praticando, você vai melhorar!'}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard/licoes')}
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voltar para Lições
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Confirmar Exclusão
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Tem certeza que deseja excluir este exercício? Esta ação não
                pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Implementar lógica de exclusão aqui
                    setShowDeleteModal(false);
                    router.push('/dashboard/licoes');
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
