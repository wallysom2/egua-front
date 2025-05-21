"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { executarCodigo as executarCodigoDelegua } from "@/lib/delegua";

interface User {
  nome: string;
  tipo: "aluno" | "professor" | "desenvolvedor";
  email?: string;
  cpf?: string;
  id?: string | number;
}

export default function Compilador() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [codigo, setCodigo] = useState(`escreva("Olá, mundo!");`);
  const [saida, setSaida] = useState<string[]>([]);
  const [executando, setExecutando] = useState(false);

  useEffect(() => {
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

  const executarCodigo = async () => {
    try {
      setExecutando(true);
      setSaida(["Executando código..."]);
      const resultado = await executarCodigoDelegua(codigo);
      setSaida(resultado);
    } catch (error: any) {
      setSaida([`Erro ao executar código: ${error.message}`]);
    } finally {
      setExecutando(false);
    }
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
      {/* Cabeçalho */}
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

      {/* Conteúdo Principal */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Compilador Égua</h1>
            <p className="text-slate-600 text-xl">Experimente seu código em um ambiente simples e amigável</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor de Código */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Editor de Código</h2>
                <button
                  onClick={executarCodigo}
                  disabled={executando}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    executando 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {executando ? 'Executando...' : 'Executar'}
                </button>
              </div>
              <textarea
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full h-[400px] p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck="false"
              />
            </div>

            {/* Área de Saída */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">Saída</h2>
              <div className="w-full h-[400px] p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm overflow-auto">
                {saida.map((linha, index) => (
                  <div key={index} className="mb-1">
                    {linha}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="py-4 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 text-lg">Égua - Plataforma de Aprendizado de Programação</p>
        </div>
      </footer>
    </div>
  );
} 