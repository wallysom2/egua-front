'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CriarQuestao } from '@/components/CriarQuestao';

import { API_BASE_URL } from '@/config/api';

interface Linguagem {
  id: number;
  nome: string;
}

interface Conteudo {
  id: number;
  titulo: string;
  linguagem_id: number;
}

interface User {
  nome: string;
  tipo: 'aluno' | 'professor' | 'desenvolvedor';
  email?: string;
}

export default function CriarExercicio() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLinguagem, setSelectedLinguagem] = useState<number | null>(
    null,
  );
  const [formData, setFormData] = useState({
    titulo: '',
    linguagem_id: 0,
    tipo: 'pratico' as 'pratico' | 'quiz',
    questoes: [] as { questao_id: number; ordem: number }[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar permissões
  const isProfessor = user?.tipo === 'professor';
  const isDesenvolvedor = user?.tipo === 'desenvolvedor';
  const temPermissao = isProfessor || isDesenvolvedor;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Verificar se o usuário tem permissão
      if (userData.tipo !== 'professor' && userData.tipo !== 'desenvolvedor') {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Erro ao processar dados do usuário:', error);
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [linguagensResponse, conteudosResponse] =
          await Promise.allSettled([
            fetch(`${API_BASE_URL}/linguagens`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(`${API_BASE_URL}/conteudos`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (
          linguagensResponse.status === 'fulfilled' &&
          linguagensResponse.value.ok
        ) {
          const data = await linguagensResponse.value.json();
          setLinguagens(data);
        }

        if (
          conteudosResponse.status === 'fulfilled' &&
          conteudosResponse.value.ok
        ) {
          const data = await conteudosResponse.value.json();
          setConteudos(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Não foi possível carregar os dados necessários.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLinguagemChange = (linguagemId: number) => {
    setSelectedLinguagem(linguagemId);
    setFormData((prev) => ({ ...prev, linguagem_id: linguagemId }));
  };

  const handleQuestaoCriada = (questaoId: number) => {
    setFormData((prev) => ({
      ...prev,
      questoes: [
        ...prev.questoes,
        { questao_id: questaoId, ordem: prev.questoes.length },
      ],
    }));
  };

  const handleExercicioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/exercicios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (response.ok) {
        router.push('/dashboard/licoes');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar exercício');
      }
    } catch (error) {
      console.error('Erro ao criar exercício:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao criar exercício. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
          Carregando...
        </p>
      </div>
    );
  }

  if (!temPermissao) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Acesso Negado
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
          Você não tem permissão para criar exercícios. Apenas professores e
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
              Criar Novo Exercício
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Crie exercícios práticos para os estudantes
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
                  Questões Adicionadas
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
                    {formData.questoes.map((questao, index) => (
                      <motion.div
                        key={questao.questao_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            Questão {index + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              questoes: prev.questoes.filter(
                                (q) => q.questao_id !== questao.questao_id,
                              ),
                            }))
                          }
                          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                      </motion.div>
                    ))}
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
                  Criando como{' '}
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
                      Criando...
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Criar Exercício
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </form>
        </div>
      </main>
    </div>
  );
}
