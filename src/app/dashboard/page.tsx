"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define a proper interface for the user object
interface User {
  nome: string;
  tipo: "aluno" | "professor" | "desenvolvedor";
  email?: string;
  cpf?: string;
  id?: string | number;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está logado
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Erro ao processar dados do usuário:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-3xl font-bold text-white flex items-center gap-3">
              🏛️ Égua Learning
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.nome?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">
                    Olá, {user?.nome?.split(' ')[0] || 'Aluno'}!
                  </p>
                  <p className="text-sm text-slate-400 capitalize">
                    {user?.tipo || 'Usuário'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Bem-vindo à sua jornada de programação
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Aprenda programação com a linguagem Égua de forma prática e interativa.
            </p>
            <div className="flex items-center justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span>Aprenda</span>
              </div>
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💻</span>
                <span>Pratique</span>
              </div>
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span>Crie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos Principais */}
      <main className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              O que você deseja fazer hoje?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Conteúdo */}
            <div className="group bg-slate-900 rounded-xl p-8 shadow-lg border border-slate-800 hover:border-slate-700 transition-all hover:shadow-2xl hover:scale-105">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Conteúdo Teórico
                </h3>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  Materiais didáticos estruturados e conceitos fundamentais.
                </p>
                <Link 
                  href="/dashboard/conteudo"
                  className="block w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-medium text-lg transform hover:scale-105"
                >
                  📖 Estudar Conteúdo
                </Link>
              </div>
            </div>

            {/* Lições */}
            <div className="group bg-slate-900 rounded-xl p-8 shadow-lg border border-slate-800 hover:border-slate-700 transition-all hover:shadow-2xl hover:scale-105">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Lições Práticas
                </h3>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  Exercícios interativos com feedback imediato.
                </p>
                <Link 
                  href="/dashboard/licoes"
                  className="block w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all font-medium text-lg transform hover:scale-105"
                >
                  🚀 Fazer Lições
                </Link>
              </div>
            </div>

            {/* Compilador */}
            <div className="group bg-slate-900 rounded-xl p-8 shadow-lg border border-slate-800 hover:border-slate-700 transition-all hover:shadow-2xl hover:scale-105">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">💻</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Compilador Online
                </h3>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  Editor de código com execução em tempo real.
                </p>
                <Link 
                  href="/dashboard/compilador"
                  className="block w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all font-medium text-lg transform hover:scale-105"
                >
                  ⚡ Abrir Compilador
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400">100+</div>
              <div className="text-slate-400">Exercícios</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-400">50+</div>
              <div className="text-slate-400">Lições</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-400">24/7</div>
              <div className="text-slate-400">Disponível</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-yellow-400">∞</div>
              <div className="text-slate-400">Possibilidades</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-400">
            🏛️ Égua Learning
          </p>
        </div>
      </footer>
    </div>
  );
} 