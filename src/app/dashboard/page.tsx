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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Cabeçalho Simplificado */}
      <header className="py-4 bg-white shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-3xl font-bold text-blue-600">
            Égua
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <p className="font-medium mr-4">Olá, {user?.nome?.split(' ')[0] || 'Aluno'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors text-lg"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal Simplificado */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo(a) à sua área de estudo</h1>
            <p className="text-slate-600 text-xl">O que você deseja fazer hoje?</p>
          </div>

          {/* Três módulos simplificados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Conteúdo */}
            <div className="bg-white rounded-xl p-6 shadow-md flex flex-col text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4 mx-auto">📚</div>
              <h2 className="text-2xl font-bold mb-3">Conteúdo</h2>
              <p className="text-slate-600 text-lg mb-6">
                Aprenda as bases da programação com materiais fáceis de entender.
              </p>
              <Link 
                href="/dashboard/conteudo"
                className="mt-auto w-full text-center py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-lg font-medium"
              >
                Acessar Conteúdo
              </Link>
            </div>

            {/* Lições */}
            <div className="bg-white rounded-xl p-6 shadow-md flex flex-col text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4 mx-auto">📝</div>
              <h2 className="text-2xl font-bold mb-3">Lições</h2>
              <p className="text-slate-600 text-lg mb-6">
                Pratique com exercícios simples e aprenda no seu próprio ritmo.
              </p>
              <Link 
                href="/dashboard/licoes"
                className="mt-auto w-full text-center py-4 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-lg font-medium"
              >
                Acessar Lições
              </Link>
            </div>

            {/* Compilador */}
            <div className="bg-white rounded-xl p-6 shadow-md flex flex-col text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4 mx-auto">💻</div>
              <h2 className="text-2xl font-bold mb-3">Compilador</h2>
              <p className="text-slate-600 text-lg mb-6">
                Experimente seu código em um ambiente simples e amigável.
              </p>
              <Link 
                href="/dashboard/compilador"
                className="mt-auto w-full text-center py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-lg font-medium"
              >
                Acessar Compilador
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé Simplificado */}
      <footer className="py-4 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 text-lg">Égua - Plataforma de Aprendizado de Programação</p>
        </div>
      </footer>
    </div>
  );
} 