"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Conteudo {
  id: number;
  titulo: string;
  corpo: string;
  nivel_leitura: "basico" | "intermediario";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<"todos" | "basico" | "intermediario">("todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const checkUserType = () => {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setIsProfessor(userData.tipo === "professor");
        setIsDesenvolvedor(userData.tipo === "desenvolvedor");
      }
    };

    const fetchConteudos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/conteudos`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Erro ao carregar conteúdos: ${response.status}`);
        }

        const data = await response.json();
        setConteudos(data);
        setFilteredConteudos(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar conteúdos. Tente novamente mais tarde.";
        setError(errorMessage);
        console.error("Erro detalhado:", err);
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
      filtered = filtered.filter(conteudo => 
        conteudo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conteudo.corpo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (selectedLevel !== "todos") {
      filtered = filtered.filter(conteudo => conteudo.nivel_leitura === selectedLevel);
    }

    setFilteredConteudos(filtered);
  }, [conteudos, searchTerm, selectedLevel]);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este conteúdo?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/conteudos/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir conteúdo");
      }

      setConteudos(conteudos.filter((conteudo) => conteudo.id !== id));
    } catch (err) {
      setError("Erro ao excluir conteúdo. Tente novamente mais tarde.");
      console.error(err);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLevel("todos");
  };

  const conteudosBasicos = conteudos.filter(c => c.nivel_leitura === "basico").length;
  const conteudosIntermediarios = conteudos.filter(c => c.nivel_leitura === "intermediario").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-white">Carregando conteúdos...</p>
          <p className="text-slate-400 mt-2">Aguarde enquanto buscamos o melhor conteúdo para você</p>
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
          <span className="text-white">Conteúdo</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              📚 Biblioteca de Conteúdo
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
              ☀️ Claro
            </button>
            {(isProfessor || isDesenvolvedor) && (
              <Link
                href="/dashboard/conteudo/criar"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                ➕ Novo Conteúdo
              </Link>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-slate-800/50 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🔍 Buscar conteúdo
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o título ou palavras-chave..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Level Filter */}
            <div className="lg:w-64">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📊 Filtrar por nível
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="todos">Todos os níveis</option>
                <option value="basico">🌱 Básico</option>
                <option value="intermediario">🚀 Intermediário</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="lg:w-32">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                👁️ Visualização
              </label>
              <div className="flex rounded-lg border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                    viewMode === "grid" 
                      ? "bg-blue-600 text-white" 
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                    viewMode === "list" 
                      ? "bg-blue-600 text-white" 
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedLevel !== "todos") && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-slate-400">Filtros ativos:</span>
                {searchTerm && (
                  <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm border border-blue-700">
                    Busca: "{searchTerm}"
                  </span>
                )}
                {selectedLevel !== "todos" && (
                  <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm border border-purple-700">
                    Nível: {selectedLevel === "basico" ? "🌱 Básico" : "🚀 Intermediário"}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm hover:bg-slate-600 transition-colors"
                >
                  ✕ Limpar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-8 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Erro ao carregar conteúdo</p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400">
            {filteredConteudos.length === conteudos.length 
              ? `Mostrando todos os ${filteredConteudos.length} conteúdos`
              : `Mostrando ${filteredConteudos.length} de ${conteudos.length} conteúdos`
            }
          </p>
        </div>

        {/* Content Display */}
        {filteredConteudos.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredConteudos.map((conteudo) => (
              <div
                key={conteudo.id}
                className={`group bg-slate-900/50 backdrop-blur rounded-xl shadow-lg border border-slate-800/50 hover:border-slate-700/50 transition-all hover:shadow-2xl ${
                  viewMode === "grid" ? "p-6 hover:scale-105" : "p-4 flex items-center gap-6"
                }`}
              >
                {viewMode === "grid" ? (
                  <>
                    {/* Grid View */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {conteudo.nivel_leitura === "basico" ? "🌱" : "🚀"}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            conteudo.nivel_leitura === "basico"
                              ? "bg-green-900/50 text-green-300 border border-green-700/50"
                              : "bg-purple-900/50 text-purple-300 border border-purple-700/50"
                          }`}
                        >
                          {conteudo.nivel_leitura === "basico" ? "Básico" : "Intermediário"}
                        </span>
                      </div>
                    </div>

                    <h2 
                      className="text-xl font-bold mb-3 text-white leading-tight line-clamp-2" 
                      dangerouslySetInnerHTML={{ __html: conteudo.titulo }} 
                    />

                    <div
                      className="text-slate-300 mb-6 line-clamp-3 text-sm leading-relaxed"
                      //dangerouslySetInnerHTML={{ __html: conteudo.corpo }}
                    />

                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/conteudo/${conteudo.id}`}
                        className="flex-1 text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all font-medium transform hover:scale-105"
                      >
                        📖 Ler
                      </Link>
                      
                      {(isProfessor || isDesenvolvedor) && (
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/conteudo/editar/${conteudo.id}`}
                            className="p-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-yellow-400 transition-colors"
                            title="Editar conteúdo"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleDelete(conteudo.id)}
                            className="p-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                            title="Excluir conteúdo"
                          >
                            🗑️
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
                        <div className="text-xl">
                          {conteudo.nivel_leitura === "basico" ? "🌱" : "🚀"}
                        </div>
                        <h2 
                          className="text-lg font-bold text-white flex-1" 
                          dangerouslySetInnerHTML={{ __html: conteudo.titulo }} 
                        />
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            conteudo.nivel_leitura === "basico"
                              ? "bg-green-900/50 text-green-300 border border-green-700/50"
                              : "bg-purple-900/50 text-purple-300 border border-purple-700/50"
                          }`}
                        >
                          {conteudo.nivel_leitura === "basico" ? "Básico" : "Intermediário"}
                        </span>
                      </div>
                      <div
                        className="text-slate-400 line-clamp-2 text-sm"
                        //dangerouslySetInnerHTML={{ __html: conteudo.corpo }}
                      />
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        href={`/dashboard/conteudo/${conteudo.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all font-medium text-sm"
                      >
                        📖 Ler
                      </Link>
                      
                      {(isProfessor || isDesenvolvedor) && (
                        <>
                          <Link
                            href={`/dashboard/conteudo/editar/${conteudo.id}`}
                            className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-yellow-400 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleDelete(conteudo.id)}
                            className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800/50">
            <div className="text-6xl mb-6">
              {searchTerm || selectedLevel !== "todos" ? "🔍" : "📚"}
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {searchTerm || selectedLevel !== "todos" 
                ? "Nenhum conteúdo encontrado" 
                : "Nenhum conteúdo disponível"
              }
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              {searchTerm || selectedLevel !== "todos" 
                ? "Tente ajustar os filtros ou fazer uma nova busca"
                : (isProfessor || isDesenvolvedor) 
                  ? "Comece criando seu primeiro conteúdo educacional"
                  : "Entre em contato com um professor ou desenvolvedor para ter acesso aos conteúdos"
              }
            </p>
            {searchTerm || selectedLevel !== "todos" ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                🔄 Limpar filtros
              </button>
            ) : (isProfessor || isDesenvolvedor) && (
              <Link
                href="/dashboard/conteudo/criar"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
              >
                ➕ Criar Primeiro Conteúdo
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 