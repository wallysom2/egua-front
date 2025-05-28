"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CriarQuestao } from "@/components/CriarQuestao";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  tipo: "aluno" | "professor" | "desenvolvedor";
  email?: string;
}

export default function CriarQuestaoPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLinguagem, setSelectedLinguagem] = useState<number | null>(null);
  const [tipoQuestao, setTipoQuestao] = useState<"pratico" | "quiz">("pratico");

  // Verificar permissões
  const isProfessor = user?.tipo === "professor";
  const isDesenvolvedor = user?.tipo === "desenvolvedor";
  const temPermissao = isProfessor || isDesenvolvedor;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Verificar se o usuário tem permissão
      if (userData.tipo !== "professor" && userData.tipo !== "desenvolvedor") {
        router.push("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Erro ao processar dados do usuário:", error);
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [linguagensResponse, conteudosResponse] = await Promise.allSettled([
          fetch(`${API_URL}/linguagens`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/conteudos`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ]);

        if (linguagensResponse.status === "fulfilled" && linguagensResponse.value.ok) {
          const data = await linguagensResponse.value.json();
          setLinguagens(data);
        }

        if (conteudosResponse.status === "fulfilled" && conteudosResponse.value.ok) {
          const data = await conteudosResponse.value.json();
          setConteudos(data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Não foi possível carregar os dados necessários.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleQuestaoCriada = (_questaoId: number) => {
    // Redireciona para a página de lições após criar a questão
    router.push("/dashboard/licoes");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Carregando...</p>
      </div>
    );
  }

  if (!temPermissao) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Acesso Negado</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
          Você não tem permissão para criar questões. Apenas professores e desenvolvedores podem acessar esta área.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 hover:scale-105 transition-transform"
              >
                🏛️ <span>Égua</span>
              </Link>
              <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
                <span>›</span>
                <Link href="/dashboard/licoes" className="hover:text-slate-900 dark:hover:text-white transition-colors">Lições</Link>
                <span>›</span>
                <span className="text-slate-900 dark:text-white font-medium">Criar Questão</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Criar Nova Questão</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Crie questões de programação ou quiz para enriquecer as lições do sistema
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Linguagem de Programação
                </label>
                <select
                  value={selectedLinguagem || ""}
                  onChange={(e) => setSelectedLinguagem(Number(e.target.value) || null)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-slate-900 dark:text-white"
                >
                  <option value="">Todas as linguagens</option>
                  {linguagens.map((linguagem) => (
                    <option key={linguagem.id} value={linguagem.id}>
                      {linguagem.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Questão
                </label>
                <select
                  value={tipoQuestao}
                  onChange={(e) => setTipoQuestao(e.target.value as "pratico" | "quiz")}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-slate-900 dark:text-white"
                >
                  <option value="pratico">🔥 Prático (Programação)</option>
                  <option value="quiz">📝 Quiz (Múltipla Escolha)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <CriarQuestao
                conteudos={conteudos}
                selectedLinguagem={selectedLinguagem}
                onQuestaoCriada={handleQuestaoCriada}
                tipo={tipoQuestao}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-between items-center mt-8"
          >
            <Link
              href="/dashboard/licoes"
              className="flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar às Lições
            </Link>
            
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Criando questão como <span className="font-medium capitalize">{user?.tipo}</span>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
} 