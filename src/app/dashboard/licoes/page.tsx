'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { ContentCard } from '@/components/ContentCard';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface Exercicio {
  id: number;
  titulo: string;
  tipo: 'pratico' | 'quiz';
  linguagem_id: number;
  created_at?: string;
  updated_at?: string;
}

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
}

interface SortableValue {
  titulo: string;
  tipo: 'pratico' | 'quiz';
}

// Função auxiliar para inferir o tipo do exercício baseado nas questões
function inferirTipoExercicio(exercicio: any): 'pratico' | 'quiz' {
  // Se já tem o campo tipo, usar ele
  if (exercicio.tipo) {
    const tipoNormalizado = String(exercicio.tipo).toLowerCase().trim();
    if (
      tipoNormalizado === 'pratico' ||
      tipoNormalizado === 'programacao' ||
      tipoNormalizado === 'programação' ||
      tipoNormalizado === 'codigo' ||
      tipoNormalizado === 'código'
    ) {
      return 'pratico';
    }
    if (tipoNormalizado === 'quiz') {
      return 'quiz';
    }
  }
  
  // Se não tem tipo, inferir baseado nas questões
  const exercicioComQuestoes = exercicio as any;
  if (exercicioComQuestoes.exercicio_questao && Array.isArray(exercicioComQuestoes.exercicio_questao)) {
    const questoes = exercicioComQuestoes.exercicio_questao;
    if (questoes.length === 0) return 'pratico'; // Default
    
    // Se alguma questão é de programação, o exercício é prático
    const temProgramacao = questoes.some(
      (eq: any) => eq.questao?.tipo === 'programacao' || eq.questao?.tipo === 'programação'
    );
    
    if (temProgramacao) {
      return 'pratico';
    }
    
    // Se todas são quiz, então é quiz
    const todasSaoQuiz = questoes.every(
      (eq: any) => eq.questao?.tipo === 'quiz'
    );
    
    if (todasSaoQuiz) {
      return 'quiz';
    }
  }
  
  // Default para prático
  return 'pratico';
}

// Função auxiliar para normalizar o tipo do exercício
function normalizarTipoExercicio(tipo: string | undefined | null): 'pratico' | 'quiz' {
  if (!tipo) return 'pratico';
  
  const tipoNormalizado = String(tipo).toLowerCase().trim();
  
  // Variações de prático
  if (
    tipoNormalizado === 'pratico' ||
    tipoNormalizado === 'programacao' ||
    tipoNormalizado === 'programação' ||
    tipoNormalizado === 'codigo' ||
    tipoNormalizado === 'código'
  ) {
    return 'pratico';
  }
  
  // Default para quiz
  return 'quiz';
}

export default function Licoes() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [filteredExercicios, setFilteredExercicios] = useState<Exercicio[]>([]);
  const [linguagensMap, setLinguagensMap] = useState<Map<number, string>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<
    'todos' | 'pratico' | 'quiz'
  >('todos');
  const [selectedStatus, setSelectedStatus] = useState<
    'todos' | 'nao_iniciado' | 'em_andamento' | 'concluido'
  >('todos');
  const [selectedLinguagem, setSelectedLinguagem] = useState<number | 'todas'>(
    'todas',
  );
  const [sortBy, setSortBy] = useState<'titulo' | 'tipo'>('titulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Estados para UX
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [exercicioToDelete, setExercicioToDelete] = useState<number | null>(
    null,
  );

  const getStatusExercicio = (): 'em_andamento' | 'concluido' | null => {
    // Por enquanto retorna null - implementar lógica de status conforme necessário
    return null;
  };

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Verificar permissões do usuário
  const isProfessor = user?.tipo === 'professor';
  const isDesenvolvedor = user?.tipo === 'desenvolvedor';

  const handleDeleteExercicio = async (exercicioId: number) => {
    setExercicioToDelete(exercicioId);

    try {
      await apiClient.delete(`/exercicios/${exercicioId}`);

      setExercicios(exercicios.filter((ex) => ex.id !== exercicioId));
      addToast({
        type: 'success',
        message: 'Exercício excluído com sucesso!',
        description: 'O exercício foi removido permanentemente',
      });
    } catch (error) {
      console.error('Erro ao excluir exercício:', error);
      addToast({
        type: 'error',
        message: 'Erro ao excluir exercício',
        description: 'Tente novamente mais tarde',
      });
    } finally {
      setExercicioToDelete(null);
      setShowDeleteModal(null);
    }
  };

  const handleEditExercicio = (exercicioId: number) => {
    router.push(`/dashboard/licoes/editar/${exercicioId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTipo('todos');
    setSelectedStatus('todos');
    setSelectedLinguagem('todas');
    setSortBy('titulo');
    setSortOrder('asc');
  };

  // Filtrar e ordenar exercícios
  useEffect(() => {
    let filtered = [...exercicios]; // Criar cópia para não modificar o array original

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter((exercicio) =>
        exercicio.titulo.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtro por tipo - usar tipo normalizado
    if (selectedTipo !== 'todos') {
      filtered = filtered.filter((exercicio) => {
        const tipoNormalizado = normalizarTipoExercicio(exercicio.tipo);
        return tipoNormalizado === selectedTipo;
      });
    }

    // Filtro por linguagem
    if (selectedLinguagem !== 'todas') {
      filtered = filtered.filter(
        (exercicio) => exercicio.linguagem_id === selectedLinguagem,
      );
    }

    // Filtro por status
    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(() => {
        const status = getStatusExercicio();
        if (selectedStatus === 'nao_iniciado') return !status;
        return status === selectedStatus;
      });
    }

    // Ordenação com agrupamento por tipo quando filtro de tipo está ativo
    filtered.sort((a, b) => {
      // Se o filtro de tipo está ativo, agrupar por tipo primeiro
      if (selectedTipo !== 'todos') {
        const tipoA = normalizarTipoExercicio(a.tipo);
        const tipoB = normalizarTipoExercicio(b.tipo);
        
        // Se os tipos são diferentes, manter a ordem (já estão filtrados)
        if (tipoA !== tipoB) {
          return 0;
        }
      } else {
        // Se não há filtro de tipo, agrupar por tipo primeiro quando ordenar por tipo
        if (sortBy === 'tipo') {
          const tipoA = normalizarTipoExercicio(a.tipo);
          const tipoB = normalizarTipoExercicio(b.tipo);
          
          if (tipoA !== tipoB) {
            // Prático primeiro, depois Quiz
            if (tipoA === 'pratico') return sortOrder === 'asc' ? -1 : 1;
            if (tipoB === 'pratico') return sortOrder === 'asc' ? 1 : -1;
            return 0;
          }
        }
      }

      // Depois ordenar pelo critério selecionado dentro do mesmo grupo
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case 'titulo':
          aVal = a.titulo.toLowerCase();
          bVal = b.titulo.toLowerCase();
          break;
        case 'tipo':
          // Se já agrupamos por tipo acima, ordenar por título dentro do grupo
          aVal = a.titulo.toLowerCase();
          bVal = b.titulo.toLowerCase();
          break;
        default:
          aVal = a.titulo.toLowerCase();
          bVal = b.titulo.toLowerCase();
      }

      // Comparação para strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }

      return 0;
    });

    // Criar nova referência do array ordenado para garantir que o React detecte a mudança
    setFilteredExercicios([...filtered]);
  }, [
    exercicios,
    searchTerm,
    selectedTipo,
    selectedStatus,
    selectedLinguagem,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (authLoading || !isAuthenticated) {
      return;
    }

    const fetchData = async () => {
      try {
        const [exerciciosData, linguagensData] = await Promise.all([
          apiClient.get<Exercicio[]>('/exercicios'),
          apiClient.get<{ id: number; nome: string }[]>('/linguagens'),
        ]);

        if (Array.isArray(exerciciosData)) {
          // Inferir e normalizar tipos dos exercícios baseado nas questões
          const exerciciosNormalizados = exerciciosData.map((ex) => {
            const tipoInferido = inferirTipoExercicio(ex);
            return {
              ...ex,
              tipo: tipoInferido,
            };
          });
          
          // Log para debug - verificar tipos dos exercícios
          console.log('Exercícios carregados (antes normalização):', exerciciosData.map((ex: any) => ({
            id: ex.id,
            titulo: ex.titulo,
            tipo: ex.tipo,
            tipoRaw: typeof ex.tipo,
            temQuestoes: !!ex.exercicio_questao,
            tiposQuestoes: ex.exercicio_questao?.map((eq: any) => eq.questao?.tipo) || []
          })));
          console.log('Exercícios carregados (após normalização):', exerciciosNormalizados.map(ex => ({
            id: ex.id,
            titulo: ex.titulo,
            tipo: ex.tipo,
          })));
          
          setExercicios(exerciciosNormalizados);
        }

        if (Array.isArray(linguagensData)) {
          const map = new Map<number, string>();
          linguagensData.forEach((lang) => map.set(lang.id, lang.nome));
          setLinguagensMap(map);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Não foi possível carregar os dados.');
        addToast({
          type: 'error',
          message: 'Erro ao carregar dados',
          description: 'Verifique sua conexão e tente novamente',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, isAuthenticated, authLoading]);

  const totalExercicios = exercicios.length;

  if (loading) {
    return <Loading text="Carregando lições..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-bg-primary transition-colors">
        <div className="text-center py-16 bg-white dark:bg-bg-secondary backdrop-blur rounded-xl border border-slate-200 dark:border-border-custom/50 max-w-md mx-auto shadow-lg">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-4">
            Erro ao carregar
          </h2>
          <p className="text-slate-600 dark:text-text-secondary mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🔄 Tentar Novamente
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-slate-200 dark:bg-bg-tertiary text-slate-900 dark:text-text-primary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover transition-colors flex items-center gap-2"
            >
              ← Voltar ao Painel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-bg-primary dark:via-bg-secondary dark:to-bg-primary text-slate-900 dark:text-text-primary transition-colors">
      {/* Navbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full z-40 py-4 border-b border-slate-200 dark:border-border-custom bg-white/80 dark:bg-bg-secondary backdrop-blur-sm"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/dashboard"
                className="text-2xl font-bold text-slate-900 dark:text-text-primary flex items-center gap-2"
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
              <BackButton href="/dashboard" />
              <ThemeToggle />
              {(isProfessor || isDesenvolvedor) && (
                <Link
                  href="/dashboard/licoes/criar/exercicio"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  Novo Exercício
                </Link>
              )}
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
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-2">
                  Lições de Programação
                </h1>

              </div>
            </div>
          </motion.div>

          {/* Filtros e Busca */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-bg-secondary backdrop-blur rounded-xl p-6 border border-slate-200 dark:border-border-custom mb-8 shadow-sm"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Busca */}
              <div className="lg:col-span-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                  Buscar exercício
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o título do exercício..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filtro por Tipo */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                  Tipo
                </label>
                <select
                  value={selectedTipo}
                  onChange={(e) =>
                    setSelectedTipo(
                      e.target.value as 'todos' | 'pratico' | 'quiz',
                    )
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="todos">Todos</option>
                  <option value="pratico">Prático</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>

              {/* Filtro por Linguagem */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                  Linguagem
                </label>
                <select
                  value={selectedLinguagem}
                  onChange={(e) =>
                    setSelectedLinguagem(
                      e.target.value === 'todas'
                        ? 'todas'
                        : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="todas">Todas</option>
                  {Array.from(linguagensMap.entries()).map(([id, nome]) => (
                    <option key={id} value={id}>
                      {nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordenação */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                  Ordenar por
                </label>
                <div className="flex gap-2">
                   <select
                     value={sortBy}
                     onChange={(e) =>
                       setSortBy(e.target.value as 'titulo' | 'tipo')
                     }
                     className="flex-1 px-3 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                   >
                     <option value="titulo">Título</option>
                     <option value="tipo">Tipo</option>
                   </select>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                    className="px-3 py-3 bg-slate-200 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover hover:text-slate-900 dark:hover:text-text-primary transition-colors"
                    title={`Ordenar ${sortOrder === 'asc' ? 'decrescente' : 'crescente'
                      }`}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            {/* Filtros Ativos e Ações */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-border-custom">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-slate-600 dark:text-text-secondary font-medium">
                    Filtros ativos:
                  </span>
                  {searchTerm && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-700">
                      Busca: &quot;{searchTerm}&quot;
                    </span>
                  )}
                  {selectedTipo !== 'todos' && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm border border-purple-200 dark:border-purple-700">
                      {selectedTipo === 'pratico' ? 'Prático' : 'Quiz'}
                    </span>
                  )}
                  {selectedLinguagem !== 'todas' && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm border border-yellow-200 dark:border-yellow-700">
                      {linguagensMap.get(selectedLinguagem as number)}
                    </span>
                  )}
                   {(searchTerm ||
                     selectedTipo !== 'todos' ||
                     selectedLinguagem !== 'todas') && (
                      <button
                        onClick={clearFilters}
                        className="px-3 py-1 bg-slate-100 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-full text-sm hover:bg-slate-200 dark:hover:bg-border-hover transition-colors flex items-center gap-1"
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
                    )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-text-secondary">
                    {filteredExercicios.length} de {totalExercicios} exercícios
                  </span>
                  <div className="flex rounded-lg border border-slate-300 dark:border-border-custom overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-50 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-bg-tertiary'
                        }`}
                    >
                      ⊞ Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-50 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-bg-tertiary'
                        }`}
                    >
                      ☰ Lista
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Exercícios */}
          {filteredExercicios.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-bg-secondary backdrop-blur rounded-xl border border-slate-200 dark:border-border-custom/50 shadow-sm">
              <div className="text-6xl mb-6">
                {searchTerm ||
                  selectedTipo !== 'todos' ||
                  selectedLinguagem !== 'todas'
                  ? '🔍'
                  : '📚'}
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-4">
                 {searchTerm ||
                   selectedTipo !== 'todos' ||
                   selectedLinguagem !== 'todas'
                   ? 'Nenhum exercício encontrado'
                   : 'Nenhum exercício criado ainda'}
              </h3>
              <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 max-w-md mx-auto leading-relaxed">
                 {searchTerm ||
                   selectedTipo !== 'todos' ||
                   selectedLinguagem !== 'todas'
                   ? 'Tente ajustar os filtros ou fazer uma nova busca'
                   : isProfessor || isDesenvolvedor
                     ? 'Comece criando seu primeiro exercício de programação!'
                     : 'Entre em contato com um professor ou desenvolvedor para ter acesso aos exercícios'}
              </p>
               {searchTerm ||
                 selectedTipo !== 'todos' ||
                 selectedLinguagem !== 'todas' ? (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-bg-tertiary text-slate-900 dark:text-text-primary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover transition-colors"
                >
                  🔄 Limpar filtros
                </button>
              ) : (
                (isProfessor || isDesenvolvedor) && (
                  <Link
                    href="/dashboard/licoes/criar/exercicio"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
                  >
                    ➕ Criar Primeiro Exercício
                  </Link>
                )
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredExercicios.map((exercicio: Exercicio, index: number) => {
                const status = getStatusExercicio();
                const isCompleted = status === 'concluido';
                const isInProgress = status === 'em_andamento';

                const badges = [];

                // Type Badge - usar tipo normalizado
                const tipoNormalizado = normalizarTipoExercicio(exercicio.tipo);
                const isPratico = tipoNormalizado === 'pratico';
                
                badges.push({
                  text: isPratico ? 'Prático' : 'Quiz',
                  variant: isPratico ? 'blue' : 'purple'
                });

                // Status Badge
                if (status) {
                  badges.push({
                    text: isCompleted ? 'Concluído' : 'Em andamento',
                    variant: isCompleted ? 'green' : 'yellow'
                  });
                }

                return (
                  <ContentCard
                    key={exercicio.id}
                    index={index}
                    title={exercicio.titulo}
                    subtitle={linguagensMap.get(exercicio.linguagem_id) || 'Carregando...'}
                    badges={badges as any}
                    mainAction={{
                      label: isCompleted
                        ? '📖 Revisar'
                        : isInProgress
                          ? '▶️ Continuar'
                          : 'Iniciar',
                      href: `/dashboard/licoes/${exercicio.id}`,
                    }}
                    editAction={{
                      onClick: () => handleEditExercicio(exercicio.id),
                    }}
                    deleteAction={{
                      onClick: () => setShowDeleteModal(exercicio.id),
                    }}
                    viewMode={viewMode}
                    showActions={isProfessor || isDesenvolvedor}
                  />
                );
              })}
            </motion.div>
          )}
        </div>
      </main>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-2">
                  Confirmar Exclusão
                </h3>
                <p className="text-slate-600 dark:text-text-secondary mb-6">
                  Tem certeza que deseja excluir este exercício? Esta ação não
                  pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    disabled={exercicioToDelete === showDeleteModal}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-bg-tertiary text-slate-900 dark:text-text-primary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDeleteExercicio(showDeleteModal)}
                    disabled={exercicioToDelete === showDeleteModal}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {exercicioToDelete === showDeleteModal ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Excluindo...
                      </>
                    ) : (
                      '🗑️ Excluir'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className={`p-4 rounded-lg border backdrop-blur shadow-2xl max-w-sm ${toast.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/90 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
                : toast.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
                  : toast.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/90 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
                    : 'bg-blue-50 dark:bg-blue-900/90 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">
                  {toast.type === 'success'
                    ? '✅'
                    : toast.type === 'error'
                      ? '❌'
                      : toast.type === 'warning'
                        ? '⚠️'
                        : 'ℹ️'}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{toast.message}</p>
                  {toast.description && (
                    <p className="text-sm opacity-90 mt-1">
                      {toast.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                  }
                  className="text-current opacity-70 hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
