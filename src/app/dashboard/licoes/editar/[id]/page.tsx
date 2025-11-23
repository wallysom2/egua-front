'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loading } from '@/components/Loading';
import { CriarQuestao } from '@/components/CriarQuestao';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { processarExercicio } from '@/utils/exercicioProcessors';
import type { Exercicio, Questao } from '@/types/exercicio';

interface Linguagem {
  id: number;
  nome: string;
}

interface Conteudo {
  id: number;
  titulo: string;
  linguagem_id: number;
}

type EditarExercicioProps = {
  params: Promise<{ id: string }>;
};

export default function EditarExercicio({ params }: EditarExercicioProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercicioId, setExercicioId] = useState<number | null>(null);
  const [selectedLinguagem, setSelectedLinguagem] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    linguagem_id: 0,
    tipo: 'pratico' as 'pratico' | 'quiz',
    questoes: [] as { questao_id: number; ordem: number }[],
  });
  const [questoesExistentes, setQuestoesExistentes] = useState<Questao[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questaoEditando, setQuestaoEditando] = useState<Questao | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Verificar permissões
  const isProfessor = user?.tipo === 'professor';
  const isDesenvolvedor = user?.tipo === 'desenvolvedor';
  const temPermissao = isProfessor || isDesenvolvedor;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (authLoading || !isAuthenticated) {
      return;
    }

    // Verificar se o usuário tem permissão
    if (user && user.tipo !== 'professor' && user.tipo !== 'desenvolvedor') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        const exercicioIdNum = parseInt(resolvedParams.id);
        setExercicioId(exercicioIdNum);

        // Buscar dados básicos
        const [exercicioData, linguagensData, conteudosData] = await Promise.all([
          apiClient.get<Exercicio>(`/exercicios/${exercicioIdNum}`),
          apiClient.get<Linguagem[]>('/linguagens'),
          apiClient.get<Conteudo[]>('/conteudos'),
        ]);

        setLinguagens(linguagensData);
        setConteudos(conteudosData);

        // Processar exercício
        const exercicioProcessado = processarExercicio(exercicioData);

        // Se não tem questões no exercício processado, tentar buscar o exercício novamente
        // ou buscar questões relacionadas através da lista de IDs no formData
        // (As questões geralmente vêm junto com o exercício via exercicio_questao)
        if (!exercicioProcessado.questoes || exercicioProcessado.questoes.length === 0) {
          console.warn('Exercício não veio com questões. Tentando buscar questões individuais...');
          // Se o exercício não veio com questões, vamos tentar buscar individualmente
          // usando os IDs das questões que podem estar no formData do exercício
          // Por enquanto, deixamos vazio e o usuário pode adicionar questões
          exercicioProcessado.questoes = [];
        }

        // Preencher formulário com dados do exercício
        setFormData({
          titulo: exercicioProcessado.titulo,
          linguagem_id: exercicioProcessado.linguagem_id,
          tipo: exercicioProcessado.tipo,
          questoes: exercicioProcessado.questoes.map((q, index) => ({
            questao_id: q.id,
            ordem: q.ordem !== undefined ? q.ordem : index,
          })),
        });

        setSelectedLinguagem(exercicioProcessado.linguagem_id);
        setQuestoesExistentes(exercicioProcessado.questoes);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Não foi possível carregar os dados do exercício.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, router, user, isAuthenticated, authLoading]);

  const handleLinguagemChange = (linguagemId: number) => {
    setSelectedLinguagem(linguagemId);
    setFormData((prev) => ({ ...prev, linguagem_id: linguagemId }));
  };

  const handleQuestaoCriada = async (questaoId: number) => {
    setFormData((prev) => ({
      ...prev,
      questoes: [
        ...prev.questoes,
        { questao_id: questaoId, ordem: prev.questoes.length },
      ],
    }));
    
    // Buscar os detalhes da questão recém-criada e adicionar à lista
    try {
      const questaoDetalhes = await apiClient.get<any>(`/questoes/${questaoId}`);
      if (questaoDetalhes) {
        const opcoes = questaoDetalhes.opcoes 
          ? (Array.isArray(questaoDetalhes.opcoes) 
              ? questaoDetalhes.opcoes.map((op: any, index: number) => ({
                  id: typeof op === 'string' ? String(index) : op.id || String(index),
                  texto: typeof op === 'string' ? op : op.texto || op,
                }))
              : [])
          : undefined;
        
        const novaQuestao: Questao = {
          id: questaoDetalhes.id,
          conteudo_id: questaoDetalhes.conteudo_id,
          enunciado: questaoDetalhes.enunciado,
          nivel: questaoDetalhes.nivel,
          tipo: questaoDetalhes.tipo,
          opcoes,
          resposta_correta: questaoDetalhes.resposta_correta,
          exemplo_resposta: questaoDetalhes.exemplo_resposta,
          ordem: formData.questoes.length,
        };
        
        setQuestoesExistentes((prev) => [...prev, novaQuestao]);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da questão:', error);
      // Mesmo se falhar, a questão já foi adicionada ao formData
    }
  };

  const handleExercicioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercicioId) return;
    
    setIsSubmitting(true);

    try {
      // Atualizar exercício
      await apiClient.put(`/exercicios/${exercicioId}`, {
        titulo: formData.titulo,
        linguagem_id: formData.linguagem_id,
        tipo: formData.tipo,
        questoes: formData.questoes,
      });
      
      router.push('/dashboard/licoes');
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar exercício. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const removerQuestao = (questaoId: number) => {
    setFormData((prev) => ({
      ...prev,
      questoes: prev.questoes.filter((q) => q.questao_id !== questaoId),
    }));
  };

  const obterQuestaoPorId = (questaoId: number): Questao | undefined => {
    return questoesExistentes.find((q) => q.id === questaoId);
  };

  const abrirModalEdicao = (questao: Questao) => {
    setQuestaoEditando(questao);
    setShowEditModal(true);
  };

  const fecharModalEdicao = () => {
    setQuestaoEditando(null);
    setShowEditModal(false);
  };

  const atualizarQuestao = async (questaoAtualizada: Questao) => {
    try {
      const dadosParaEnvio =
        questaoAtualizada.tipo === 'quiz'
          ? {
              conteudo_id: questaoAtualizada.conteudo_id || null,
              enunciado: questaoAtualizada.enunciado.trim(),
              nivel: questaoAtualizada.nivel,
              tipo: 'quiz' as const,
              opcoes: questaoAtualizada.opcoes?.map((op) => op.texto.trim()) || null,
              resposta_correta:
                questaoAtualizada.opcoes?.find((op) => op.id === questaoAtualizada.resposta_correta)?.texto.trim() || null,
              exemplo_resposta: null,
            }
          : {
              conteudo_id: questaoAtualizada.conteudo_id || null,
              enunciado: questaoAtualizada.enunciado.trim(),
              nivel: questaoAtualizada.nivel,
              tipo: 'programacao' as const,
              exemplo_resposta: questaoAtualizada.exemplo_resposta?.trim() || null,
              opcoes: null,
              resposta_correta: null,
            };

      await apiClient.put(`/questoes/${questaoAtualizada.id}`, dadosParaEnvio);
      
      // Atualizar a questão na lista local
      setQuestoesExistentes((prev) =>
        prev.map((q) => (q.id === questaoAtualizada.id ? questaoAtualizada : q))
      );
      
      fecharModalEdicao();
    } catch (error) {
      console.error('Erro ao atualizar questão:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar questão. Tente novamente.',
      );
    }
  };

  if (loading) {
    return <Loading text="Carregando exercício..." />;
  }

  if (!temPermissao) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Acesso Negado
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
          Você não tem permissão para editar exercícios. Apenas professores e
          desenvolvedores podem acessar esta área.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Voltar ao Painel
        </Link>
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

            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <main className="flex-1 py-16 pt-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Editar Exercício
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Atualize as informações do exercício e suas questões
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleExercicioSubmit} className="space-y-8">
            {/* Informações Básicas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Título do Exercício
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          titulo: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                      placeholder="Ex: Introdução às Variáveis em Senior Code AI"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Linguagem de Programação
                    </label>
                    <select
                      value={formData.linguagem_id}
                      onChange={(e) =>
                        handleLinguagemChange(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-slate-900 dark:text-white"
                      required
                    >
                      <option value="">Selecione uma linguagem</option>
                      {linguagens.map((linguagem) => (
                        <option key={linguagem.id} value={linguagem.id}>
                          {linguagem.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Seção de Questões */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                🎯 Questões
              </h2>

              {/* Tipo da Questão */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Questão
                </label>
                <div className="relative">
                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tipo: e.target.value as 'pratico' | 'quiz',
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none text-slate-900 dark:text-white"
                  >
                    <option value="" disabled>
                      Selecione o tipo de questão
                    </option>
                    <option value="pratico">Prático</option>
                    <option value="quiz">Quiz</option>
                  </select>

                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <CriarQuestao
                  conteudos={conteudos}
                  selectedLinguagem={selectedLinguagem}
                  onQuestaoCriada={handleQuestaoCriada}
                  tipo={formData.tipo}
                />
              </div>

              {/* Lista de Questões Adicionadas */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Questões do Exercício ({formData.questoes.length})
                </h3>
                {formData.questoes.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <div className="text-4xl mb-2">📝</div>
                    <p>Nenhuma questão adicionada ainda</p>
                    <p className="text-sm">
                      Adicione questões para criar seu exercício
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.questoes.map((questaoItem, index) => {
                      const questao = obterQuestaoPorId(questaoItem.questao_id);
                      return (
                        <motion.div
                          key={questaoItem.questao_id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-colors"
                          onClick={() => questao && abrirModalEdicao(questao)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium text-sm">
                                {index + 1}
                              </div>
                              <span className="font-medium text-slate-900 dark:text-white">
                                Questão {index + 1}
                              </span>
                              {questao && (
                                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                                  {questao.tipo === 'quiz' ? 'Quiz' : 'Programação'}
                                </span>
                              )}
                            </div>
                            {questao && (
                              <div className="ml-11 mt-2">
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                  {questao.enunciado}
                                </p>
                                <div className="mt-2 flex gap-2">
                                  <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                    Nível: {questao.nivel}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div 
                            className="flex items-center gap-2 ml-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => questao && abrirModalEdicao(questao)}
                              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Editar questão"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removerQuestao(questaoItem.questao_id)}
                              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Remover questão"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Ações */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-between items-center"
            >
              <Link
                href="/dashboard/licoes"
                className="flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Cancelar
              </Link>

              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Editando como{' '}
                  <span className="font-medium capitalize">{user?.tipo}</span>
                </div>
                <button
                  type="submit"
                  disabled={formData.questoes.length === 0 || isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </form>
        </div>
      </main>

      {/* Modal de Edição de Questão */}
      <AnimatePresence>
        {showEditModal && questaoEditando && (
          <ModalEditarQuestao
            questao={questaoEditando}
            conteudos={conteudos}
            selectedLinguagem={selectedLinguagem}
            onSalvar={atualizarQuestao}
            onCancelar={fecharModalEdicao}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente Modal para Editar Questão
interface ModalEditarQuestaoProps {
  questao: Questao;
  conteudos: Conteudo[];
  selectedLinguagem: number | null;
  onSalvar: (questao: Questao) => void;
  onCancelar: () => void;
}

function ModalEditarQuestao({
  questao,
  conteudos,
  selectedLinguagem,
  onSalvar,
  onCancelar,
}: ModalEditarQuestaoProps) {
  const [questaoForm, setQuestaoForm] = useState({
    conteudo_id: questao.conteudo_id || 0,
    enunciado: questao.enunciado,
    nivel: questao.nivel,
    tipo: questao.tipo,
    opcoes:
      questao.tipo === 'quiz' && questao.opcoes
        ? questao.opcoes.map((op) => ({
            id: op.id,
            texto: op.texto,
            correta: op.id === questao.resposta_correta,
          }))
        : undefined,
    exemplo_resposta: questao.exemplo_resposta || '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleAlternativaChange = (
    index: number,
    field: 'texto' | 'correta',
    value: string | boolean,
  ) => {
    setQuestaoForm((prev) => {
      const newOpcoes = prev.opcoes?.map((alt, i) => {
        if (i === index) {
          return { ...alt, [field]: value };
        }
        if (field === 'correta' && value === true) {
          return { ...alt, correta: false };
        }
        return alt;
      });

      return {
        ...prev,
        opcoes: newOpcoes,
      };
    });
  };

  const adicionarAlternativa = () => {
    setQuestaoForm((prev) => ({
      ...prev,
      opcoes: [
        ...(prev.opcoes || []),
        { id: uuidv4(), texto: '', correta: false },
      ],
    }));
  };

  const removerAlternativa = (index: number) => {
    setQuestaoForm((prev) => ({
      ...prev,
      opcoes: prev.opcoes?.filter((_, i) => i !== index),
    }));
  };

  const handleSalvar = () => {
    const errors: Record<string, string> = {};

    if (!questaoForm.enunciado.trim()) {
      errors.enunciado = 'Enunciado é obrigatório';
    }

    if (questaoForm.tipo === 'quiz') {
      if (!questaoForm.opcoes || questaoForm.opcoes.length < 2) {
        errors.opcoes = 'A questão deve ter pelo menos 2 alternativas';
      } else if (!questaoForm.opcoes.some((opt) => opt.correta)) {
        errors.opcoes = 'Selecione uma alternativa correta';
      } else if (questaoForm.opcoes.some((opt) => !opt.texto.trim())) {
        errors.opcoes = 'Preencha todas as alternativas';
      }
    } else if (questaoForm.tipo === 'programacao') {
      if (!questaoForm.exemplo_resposta?.trim()) {
        errors.exemplo_resposta = 'O exemplo de resposta é obrigatório';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const questaoAtualizada: Questao = {
      ...questao,
      conteudo_id: questaoForm.conteudo_id,
      enunciado: questaoForm.enunciado,
      nivel: questaoForm.nivel,
      tipo: questaoForm.tipo,
      opcoes: questaoForm.opcoes,
      resposta_correta:
        questaoForm.tipo === 'quiz'
          ? questaoForm.opcoes?.find((op) => op.correta)?.id
          : undefined,
      exemplo_resposta:
        questaoForm.tipo === 'programacao' ? questaoForm.exemplo_resposta : null,
    };

    onSalvar(questaoAtualizada);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancelar}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Editar Questão
          </h2>
          <button
            onClick={onCancelar}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Conteúdo de Referência
            </label>
            <select
              value={questaoForm.conteudo_id}
              onChange={(e) =>
                setQuestaoForm((prev) => ({
                  ...prev,
                  conteudo_id: Number(e.target.value),
                }))
              }
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white transition-colors ${
                validationErrors.conteudo_id
                  ? 'border-red-500'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
              disabled={!selectedLinguagem}
            >
              <option value={0}>
                {!selectedLinguagem
                  ? 'Selecione uma linguagem primeiro'
                  : 'Selecione um conteúdo'}
              </option>
              {conteudos
                .filter(
                  (conteudo) =>
                    !selectedLinguagem ||
                    conteudo.linguagem_id === selectedLinguagem,
                )
                .map((conteudo) => (
                  <option key={conteudo.id} value={conteudo.id}>
                    {conteudo.titulo}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Enunciado da Questão
            </label>
            <textarea
              value={questaoForm.enunciado}
              onChange={(e) =>
                setQuestaoForm((prev) => ({ ...prev, enunciado: e.target.value }))
              }
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors ${
                validationErrors.enunciado
                  ? 'border-red-500'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
              rows={4}
              placeholder="Descreva sua questão de forma clara e objetiva"
            />
            {validationErrors.enunciado && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {validationErrors.enunciado}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nível da Questão
            </label>
            <select
              value={questaoForm.nivel}
              onChange={(e) =>
                setQuestaoForm((prev) => ({
                  ...prev,
                  nivel: e.target.value as 'facil' | 'medio' | 'dificil',
                }))
              }
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white transition-colors"
            >
              <option value="facil">🟢 Simples</option>
              <option value="medio">🟡 Médio</option>
              <option value="dificil">🔴 Difícil</option>
            </select>
          </div>

          {questaoForm.tipo === 'quiz' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Alternativas
                </label>
                <button
                  type="button"
                  onClick={adicionarAlternativa}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Adicionar
                </button>
              </div>
              {validationErrors.opcoes && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {validationErrors.opcoes}
                </p>
              )}
              {questaoForm.opcoes?.map((alternativa, index) => (
                <div
                  key={alternativa.id}
                  className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <input
                    type="radio"
                    name="alternativa_correta"
                    checked={alternativa.correta}
                    onChange={() => handleAlternativaChange(index, 'correta', true)}
                    className="w-4 h-4 text-blue-600 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={alternativa.texto}
                    onChange={(e) =>
                      handleAlternativaChange(index, 'texto', e.target.value)
                    }
                    placeholder={`Alternativa ${index + 1}`}
                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                  />
                  {questaoForm.opcoes && questaoForm.opcoes.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removerAlternativa(index)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {questaoForm.tipo === 'programacao' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Exemplo de Resposta
              </label>
              <textarea
                value={questaoForm.exemplo_resposta}
                onChange={(e) =>
                  setQuestaoForm((prev) => ({
                    ...prev,
                    exemplo_resposta: e.target.value,
                  }))
                }
                className={`w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors ${
                  validationErrors.exemplo_resposta
                    ? 'border-red-500'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
                placeholder="// Digite aqui um exemplo de resposta em Senior Code AI"
              />
              {validationErrors.exemplo_resposta && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {validationErrors.exemplo_resposta}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
