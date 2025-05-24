"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Exercicio {
  id: number;
  titulo: string;
  tipo: "pratico" | "quiz";
  linguagem_id: number;
  created_at?: string;
  updated_at?: string;
}

interface UserExercicio {
  id: string;
  exercicio_id: number;
  status: "em_andamento" | "concluido";
  finalizado_em: string | null;
}

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
}

interface SortableValue {
  titulo: string;
  tipo: "pratico" | "quiz";
  status: "em_andamento" | "concluido" | "nao_iniciado";
  criado: Date;
}

export default function Licoes() {
  const router = useRouter();
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [filteredExercicios, setFilteredExercicios] = useState<Exercicio[]>([]);
  const [linguagensMap, setLinguagensMap] = useState<Map<number, string>>(new Map());
  const [userExercicios, setUserExercicios] = useState<UserExercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<"todos" | "pratico" | "quiz">("todos");
  const [selectedStatus, setSelectedStatus] = useState<"todos" | "nao_iniciado" | "em_andamento" | "concluido">("todos");
  const [selectedLinguagem, setSelectedLinguagem] = useState<number | "todas">("todas");
  const [sortBy, setSortBy] = useState<"titulo" | "tipo" | "status" | "criado">("titulo");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Estados para UX
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [deletingExercicio, setDeletingExercicio] = useState<number | null>(null);

  const getStatusExercicio = useCallback((exercicioId: number) => {
    const userExercicio = userExercicios.find(
      (ue: UserExercicio) => ue.exercicio_id === exercicioId
    );
    return userExercicio?.status || null;
  }, [userExercicios]);

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleDeleteExercicio = async (exercicioId: number) => {
    setDeletingExercicio(exercicioId);
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`${API_URL}/exercicios/${exercicioId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setExercicios(exercicios.filter(ex => ex.id !== exercicioId));
        addToast({
          type: 'success',
          message: 'Exercício excluído com sucesso!',
          description: 'O exercício foi removido permanentemente'
        });
      } else {
        throw new Error('Erro ao excluir exercício');
      }
    } catch (error) {
      console.error('Erro ao excluir exercício:', error);
      addToast({
        type: 'error',
        message: 'Erro ao excluir exercício',
        description: 'Tente novamente mais tarde'
      });
    } finally {
      setDeletingExercicio(null);
      setShowDeleteModal(null);
    }
  };

  const handleEditExercicio = (exercicioId: number) => {
    router.push(`/dashboard/licoes/editar/${exercicioId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTipo("todos");
    setSelectedStatus("todos");
    setSelectedLinguagem("todas");
    setSortBy("titulo");
    setSortOrder("asc");
  };

  // Filtrar e ordenar exercícios
  useEffect(() => {
    let filtered = exercicios;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(exercicio =>
        exercicio.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (selectedTipo !== "todos") {
      filtered = filtered.filter(exercicio => exercicio.tipo === selectedTipo);
    }

    // Filtro por linguagem
    if (selectedLinguagem !== "todas") {
      filtered = filtered.filter(exercicio => exercicio.linguagem_id === selectedLinguagem);
    }

    // Filtro por status
    if (selectedStatus !== "todos") {
      filtered = filtered.filter(exercicio => {
        const status = getStatusExercicio(exercicio.id);
        if (selectedStatus === "nao_iniciado") return !status;
        return status === selectedStatus;
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aVal: SortableValue[keyof SortableValue], bVal: SortableValue[keyof SortableValue];
      
      switch (sortBy) {
        case "titulo":
          aVal = a.titulo.toLowerCase();
          bVal = b.titulo.toLowerCase();
          break;
        case "tipo":
          aVal = a.tipo;
          bVal = b.tipo;
          break;
        case "status":
          aVal = getStatusExercicio(a.id) || "nao_iniciado";
          bVal = getStatusExercicio(b.id) || "nao_iniciado";
          break;
        case "criado":
          aVal = new Date(a.created_at || 0);
          bVal = new Date(b.created_at || 0);
          break;
        default:
          aVal = a.titulo;
          bVal = b.titulo;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredExercicios(filtered);
  }, [exercicios, searchTerm, selectedTipo, selectedStatus, selectedLinguagem, sortBy, sortOrder, userExercicios, getStatusExercicio]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [exerciciosResponse, linguagensResponse, userExerciciosResponse] = await Promise.allSettled([
          fetch(`${API_URL}/exercicios`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/linguagens`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/user-exercicios`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (exerciciosResponse.status === 'fulfilled' && exerciciosResponse.value.ok) {
          const data = await exerciciosResponse.value.json();
          if (Array.isArray(data)) {
            setExercicios(data);
          }
        }

        if (linguagensResponse.status === 'fulfilled' && linguagensResponse.value.ok) {
          const data = await linguagensResponse.value.json();
          const map = new Map<number, string>();
          if (Array.isArray(data)) {
            data.forEach((lang: { id: number; nome: string }) =>
              map.set(lang.id, lang.nome)
            );
            setLinguagensMap(map);
          }
        }

        if (userExerciciosResponse.status === 'fulfilled' && userExerciciosResponse.value.ok) {
          const data = await userExerciciosResponse.value.json();
          if (Array.isArray(data)) {
            setUserExercicios(data);
          }
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Não foi possível carregar os dados.");
        addToast({
          type: 'error',
          message: 'Erro ao carregar dados',
          description: 'Verifique sua conexão e tente novamente'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const totalExercicios = exercicios.length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold text-white">Carregando lições...</p>
        <p className="text-slate-400 mt-2">Preparando seus exercícios</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="text-center py-16 bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800/50 max-w-md mx-auto">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Erro ao carregar</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🔄 Tentar Novamente
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <span>›</span>
          <span className="text-white">Lições de Programação</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              🎓 Lições de Programação
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
              ☀️ Claro
            </button>
            <Link
              href="/dashboard/licoes/criar/exercicio"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              ➕ Novo Exercício
            </Link>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-slate-800/50 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Busca */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🔍 Buscar exercício
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o título do exercício..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtro por Tipo */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🎯 Tipo
              </label>
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value as "todos" | "pratico" | "quiz")}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="todos">Todos</option>
                <option value="pratico">💻 Prático</option>
                <option value="quiz">🧩 Quiz</option>
              </select>
            </div>

            {/* Filtro por Status */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📊 Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as "todos" | "nao_iniciado" | "em_andamento" | "concluido")}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="todos">Todos</option>
                <option value="nao_iniciado">🆕 Não Iniciado</option>
                <option value="em_andamento">⏳ Em Progresso</option>
                <option value="concluido">✅ Concluído</option>
              </select>
            </div>

            {/* Filtro por Linguagem */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🔤 Linguagem
              </label>
              <select
                value={selectedLinguagem}
                onChange={(e) => setSelectedLinguagem(e.target.value === "todas" ? "todas" : Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="todas">Todas</option>
                {Array.from(linguagensMap.entries()).map(([id, nome]) => (
                  <option key={id} value={id}>{nome}</option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📋 Ordenar por
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "titulo" | "tipo" | "status" | "criado")}
                  className="flex-1 px-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="titulo">Título</option>
                  <option value="tipo">Tipo</option>
                  <option value="status">Status</option>
                  <option value="criado">Data</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
                  title={`Ordenar ${sortOrder === "asc" ? "decrescente" : "crescente"}`}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

          {/* Filtros Ativos e Ações */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-slate-400">Filtros ativos:</span>
                {searchTerm && (
                  <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm border border-blue-700">
                    Busca: &quot;{searchTerm}&quot;
                  </span>
                )}
                {selectedTipo !== "todos" && (
                  <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm border border-purple-700">
                    {selectedTipo === "pratico" ? "💻 Prático" : "🧩 Quiz"}
                  </span>
                )}
                {selectedStatus !== "todos" && (
                  <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm border border-green-700">
                    Status: {selectedStatus.replace("_", " ")}
                  </span>
                )}
                {selectedLinguagem !== "todas" && (
                  <span className="px-3 py-1 bg-yellow-900/50 text-yellow-300 rounded-full text-sm border border-yellow-700">
                    {linguagensMap.get(selectedLinguagem as number)}
                  </span>
                )}
                {(searchTerm || selectedTipo !== "todos" || selectedStatus !== "todos" || selectedLinguagem !== "todas") && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm hover:bg-slate-600 transition-colors"
                  >
                    ✕ Limpar filtros
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">
                  {filteredExercicios.length} de {totalExercicios} exercícios
                </span>
                <div className="flex rounded-lg border border-slate-700 overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === "grid" 
                        ? "bg-blue-600 text-white" 
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    ⊞ Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === "list" 
                        ? "bg-blue-600 text-white" 
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    ☰ Lista
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exercícios */}
        {filteredExercicios.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800/50">
            <div className="text-6xl mb-6">
              {searchTerm || selectedTipo !== "todos" || selectedStatus !== "todos" || selectedLinguagem !== "todas" 
                ? "🔍" 
                : "📚"
              }
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              {searchTerm || selectedTipo !== "todos" || selectedStatus !== "todos" || selectedLinguagem !== "todas"
                ? "Nenhum exercício encontrado"
                : "Nenhum exercício criado ainda"
              }
            </h3>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              {searchTerm || selectedTipo !== "todos" || selectedStatus !== "todos" || selectedLinguagem !== "todas"
                ? "Tente ajustar os filtros ou fazer uma nova busca"
                : "Comece criando seu primeiro exercício de programação!"
              }
            </p>
            {searchTerm || selectedTipo !== "todos" || selectedStatus !== "todos" || selectedLinguagem !== "todas" ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                🔄 Limpar filtros
              </button>
            ) : (
              <Link
                href="/dashboard/licoes/criar/exercicio"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
              >
                ➕ Criar Primeiro Exercício
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredExercicios.map((exercicio: Exercicio) => {
              const status = getStatusExercicio(exercicio.id);
              const isCompleted = status === "concluido";
              const isInProgress = status === "em_andamento";
              
              return (
                <div
                  key={exercicio.id}
                  className={`group bg-slate-900/50 backdrop-blur rounded-xl shadow-lg border border-slate-800/50 hover:border-slate-700/50 transition-all hover:shadow-2xl ${
                    viewMode === "grid" ? "p-6 hover:scale-105" : "p-4 flex items-center gap-6"
                  }`}
                >
                  {viewMode === "grid" ? (
                    <>
                      {/* Header do Card */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {exercicio.tipo === "pratico" ? "💻" : "🧩"}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              exercicio.tipo === "pratico"
                                ? "bg-blue-900/50 text-blue-300 border border-blue-700/50"
                                : "bg-purple-900/50 text-purple-300 border border-purple-700/50"
                            }`}
                          >
                            {exercicio.tipo === "pratico" ? "Prático" : "Quiz"}
                          </span>
                        </div>
                        
                        {/* Status Badge */}
                        {status && (
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            isCompleted
                              ? "bg-green-900/50 text-green-300 border border-green-700/50"
                              : "bg-yellow-900/50 text-yellow-300 border border-yellow-700/50"
                          }`}>
                            {isCompleted ? "✅" : "⏳"}
                            {isCompleted ? "Concluído" : "Em andamento"}
                          </div>
                        )}
                      </div>

                      {/* Título e Descrição */}
                      <h2 className="text-xl font-bold mb-3 text-white leading-tight line-clamp-2">
                        {exercicio.titulo}
                      </h2>
                      <div className="flex items-center gap-2 mb-6 text-slate-400">
                        <span className="text-sm">🔤</span>
                        <span className="text-sm">
                          {linguagensMap.get(exercicio.linguagem_id) || "Carregando..."}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/licoes/${exercicio.id}`}
                          className="flex-1 text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all font-medium transform hover:scale-105"
                        >
                          {isCompleted
                            ? "📖 Revisar"
                            : isInProgress
                            ? "▶️ Continuar"
                            : "🚀 Iniciar"}
                        </Link>
                        
                        {/* Menu de Ações */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditExercicio(exercicio.id)}
                            className="p-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-blue-400 transition-colors"
                            title="Editar exercício"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(exercicio.id)}
                            className="p-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                            title="Excluir exercício"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-xl">
                            {exercicio.tipo === "pratico" ? "💻" : "🧩"}
                          </div>
                          <h2 className="text-lg font-bold text-white flex-1">
                            {exercicio.titulo}
                          </h2>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              exercicio.tipo === "pratico"
                                ? "bg-blue-900/50 text-blue-300 border border-blue-700/50"
                                : "bg-purple-900/50 text-purple-300 border border-purple-700/50"
                            }`}
                          >
                            {exercicio.tipo === "pratico" ? "Prático" : "Quiz"}
                          </span>
                          {status && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isCompleted
                                ? "bg-green-900/50 text-green-300 border border-green-700/50"
                                : "bg-yellow-900/50 text-yellow-300 border border-yellow-700/50"
                            }`}>
                              {isCompleted ? "✅ Concluído" : "⏳ Em andamento"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <span>🔤</span>
                          <span>{linguagensMap.get(exercicio.linguagem_id) || "Carregando..."}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <Link
                          href={`/dashboard/licoes/${exercicio.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all font-medium text-sm"
                        >
                          {isCompleted ? "📖 Revisar" : isInProgress ? "▶️ Continuar" : "🚀 Iniciar"}
                        </Link>
                        
                        <button
                          onClick={() => handleEditExercicio(exercicio.id)}
                          className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(exercicio.id)}
                          className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
              <p className="text-slate-400 mb-6">
                Tem certeza que deseja excluir este exercício? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  disabled={deletingExercicio === showDeleteModal}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteExercicio(showDeleteModal)}
                  disabled={deletingExercicio === showDeleteModal}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingExercicio === showDeleteModal ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Excluindo...
                    </>
                  ) : (
                    "🗑️ Excluir"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg border backdrop-blur shadow-2xl max-w-sm animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-green-900/90 border-green-700 text-green-200' :
              toast.type === 'error' ? 'bg-red-900/90 border-red-700 text-red-200' :
              toast.type === 'warning' ? 'bg-yellow-900/90 border-yellow-700 text-yellow-200' :
              'bg-blue-900/90 border-blue-700 text-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">
                {toast.type === 'success' ? '✅' : 
                 toast.type === 'error' ? '❌' : 
                 toast.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <div className="flex-1">
                <p className="font-medium">{toast.message}</p>
                {toast.description && (
                  <p className="text-sm opacity-90 mt-1">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-current opacity-70 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 