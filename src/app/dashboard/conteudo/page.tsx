'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import Image from 'next/image';

import { API_BASE_URL } from '@/config/api';

interface Conteudo {
  id: number;
  titulo: string;
  corpo: string;
  nivel_leitura: 'basico' | 'intermediario';
  linguagem_id: number;
}

export default function ConteudoPage() {
  const router = useRouter();
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [filteredConteudos, setFilteredConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfessor, setIsProfessor] = useState(false);
  const [isDesenvolvedor, setIsDesenvolvedor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<
    'todos' | 'basico' | 'intermediario'
  >('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const checkUserType = () => {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setIsProfessor(userData.tipo === 'professor');
        setIsDesenvolvedor(userData.tipo === 'desenvolvedor');
      }
    };

    const fetchConteudos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/conteudos`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message ||
              `Erro ao carregar conteúdos: ${response.status}`,
          );
        }

        const data = await response.json();
        setConteudos(data);
        setFilteredConteudos(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro ao carregar conteúdos. Tente novamente mais tarde.';
        setError(errorMessage);
        console.error('Erro detalhado:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUserType();
    fetchConteudos();
  }, [router]);

  // Filter and search logic
  useEffect(() => {
    let filtered = conteudos;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (conteudo) =>
          conteudo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conteudo.corpo.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by level
    if (selectedLevel !== 'todos') {
      filtered = filtered.filter(
        (conteudo) => conteudo.nivel_leitura === selectedLevel,
      );
    }

    setFilteredConteudos(filtered);
  }, [conteudos, searchTerm, selectedLevel]);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/conteudos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir conteúdo');
      }

      setConteudos(conteudos.filter((conteudo) => conteudo.id !== id));
    } catch (err) {
      setError('Erro ao excluir conteúdo. Tente novamente mais tarde.');
      console.error(err);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('todos');
  };

  if (loading) {
    return <Loading text="Carregando conteúdos..." />;
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
              {(isProfessor || isDesenvolvedor) && (
                <Link
                  href="/dashboard/conteudo/criar"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <span className="text-lg"></span> Novo Conteúdo
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botão Voltar */}
      <BackButton href="/dashboard" />

      {/* Conteúdo Principal */}
      <main className="flex-1 py-16 pt-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Conteúdo Teórico
                </h1>
              </div>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-8 shadow-sm"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Search */}
              <div className="lg:col-span-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Buscar conteúdo
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o título ou palavras-chave..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Level Filter */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nível
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) =>
                    setSelectedLevel(
                      e.target.value as 'todos' | 'basico' | 'intermediario',
                    )
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="todos">Todos os níveis</option>
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Visualização
                </label>
                <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
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
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    Grade
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
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
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    Lista
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedLevel !== 'todos') && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Filtros ativos:
                  </span>
                  {searchTerm && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-700">
                      Busca: &quot;{searchTerm}&quot;
                    </span>
                  )}
                  {selectedLevel !== 'todos' && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm border border-purple-200 dark:border-purple-700">
                      Nível:{' '}
                      {selectedLevel === 'basico' ? 'Básico' : 'Intermediário'}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                  >
                    <svg
                      className="w-3 h-3"
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
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-lg mb-8"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-medium">Erro ao carregar conteúdo</p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <p className="text-slate-600 dark:text-slate-400">
              {filteredConteudos.length === conteudos.length
                ? `Mostrando todos os ${filteredConteudos.length} conteúdos`
                : `Mostrando ${filteredConteudos.length} de ${conteudos.length} conteúdos`}
            </p>
          </motion.div>

          {/* Content Display */}
          {filteredConteudos.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredConteudos.map((conteudo, index) => (
                <motion.div
                  key={conteudo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`group bg-white dark:bg-slate-900/50 backdrop-blur rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md ${
                    viewMode === 'grid'
                      ? 'p-6 hover:scale-105'
                      : 'p-4 flex items-center gap-6'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="flex items-start justify-end mb-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            conteudo.nivel_leitura === 'basico'
                              ? 'bg-slate-100 dark:bg-slate-800 text-green-600 dark:text-green-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          {conteudo.nivel_leitura === 'basico'
                            ? 'Básico'
                            : 'Intermediário'}
                        </span>
                      </div>

                      <h2
                        className="text-xl font-bold mb-3 text-slate-900 dark:text-white leading-tight line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: conteudo.titulo }}
                      />

                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/conteudo/${conteudo.id}`}
                          className="flex-1 text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-medium transform hover:scale-105"
                        >
                          Ler Conteúdo
                        </Link>

                        {(isProfessor || isDesenvolvedor) && (
                          <div className="flex gap-2">
                            <Link
                              href={`/dashboard/conteudo/editar/${conteudo.id}`}
                              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Editar conteúdo"
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
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(conteudo.id)}
                              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Excluir conteúdo"
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
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2
                            className="text-lg font-bold text-slate-900 dark:text-white flex-1"
                            dangerouslySetInnerHTML={{
                              __html: conteudo.titulo,
                            }}
                          />
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              conteudo.nivel_leitura === 'basico'
                                ? 'bg-slate-100 dark:bg-slate-800 text-green-600 dark:text-green-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400'
                            }`}
                          >
                            {conteudo.nivel_leitura === 'basico'
                              ? 'Básico'
                              : 'Intermediário'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Link
                          href={`/dashboard/conteudo/${conteudo.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-medium text-sm"
                        >
                          📖 Ler
                        </Link>

                        {(isProfessor || isDesenvolvedor) && (
                          <>
                            <Link
                              href={`/dashboard/conteudo/editar/${conteudo.id}`}
                              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Editar"
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
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(conteudo.id)}
                              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Excluir"
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
                          </>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16 bg-white dark:bg-slate-900/50 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="text-6xl mb-6">
                {searchTerm || selectedLevel !== 'todos' ? '🔍' : '📚'}
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {searchTerm || selectedLevel !== 'todos'
                  ? 'Nenhum conteúdo encontrado'
                  : 'Nenhum conteúdo disponível'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm || selectedLevel !== 'todos'
                  ? 'Tente ajustar os filtros ou fazer uma nova busca'
                  : isProfessor || isDesenvolvedor
                  ? 'Comece criando seu primeiro conteúdo educacional'
                  : 'Entre em contato com um professor ou desenvolvedor para ter acesso aos conteúdos'}
              </p>
              {searchTerm || selectedLevel !== 'todos' ? (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  🔄 Limpar filtros
                </button>
              ) : (
                (isProfessor || isDesenvolvedor) && (
                  <Link
                    href="/dashboard/conteudo/criar"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
                  >
                    ➕ Criar Primeiro Conteúdo
                  </Link>
                )
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
