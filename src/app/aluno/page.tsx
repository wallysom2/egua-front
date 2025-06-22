'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  nome: string;
  tipo: 'aluno' | 'professor' | 'desenvolvedor';
  email?: string;
  cpf?: string;
  id?: string | number;
}

interface Exercicio {
  id: number;
  titulo: string;
  tipo: 'pratico' | 'quiz';
  linguagem_id: number;
  created_at?: string;
  updated_at?: string;
  status?: 'nao_iniciado' | 'em_andamento' | 'concluido';
  progresso?: any;
}

export default function DashboardAluno() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [linguagensMap, setLinguagensMap] = useState<Map<number, string>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Verificar se é aluno - se não for, redirecionar para dashboard normal
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.tipo !== 'aluno') {
          router.push('/dashboard');
          return;
        }
        setUser(userData);
      } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
        router.push('/login');
        return;
      }
    }

    const fetchData = async () => {
      try {
        const [exerciciosResponse, linguagensResponse] =
          await Promise.allSettled([
            fetch(`${API_URL}/exercicios`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/linguagens`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (
          exerciciosResponse.status === 'fulfilled' &&
          exerciciosResponse.value.ok
        ) {
          const data = await exerciciosResponse.value.json();
          if (Array.isArray(data)) {
            setExercicios(data);
          }
        }

        if (
          linguagensResponse.status === 'fulfilled' &&
          linguagensResponse.value.ok
        ) {
          const data = await linguagensResponse.value.json();
          const map = new Map<number, string>();
          if (Array.isArray(data)) {
            data.forEach((lang: { id: number; nome: string }) =>
              map.set(lang.id, lang.nome),
            );
            setLinguagensMap(map);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mb-6"></div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
            Carregando suas lições...
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Preparando sua experiência de aprendizado
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">😕</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Oops! Algo deu errado
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Header Simplificado */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full z-40 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm"
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <div className="flex items-center gap-3">
                <Image
                  src="/hu.png"
                  alt="Senior Code AI Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Senior Code AI
                  </h1>
                  <p className="text-base text-slate-600 dark:text-slate-400">
                    Olá, {user?.nome?.split(' ')[0] || 'Aluno'}!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Controles */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-lg font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <main className="flex-1 py-20 pt-36">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Título da Seção */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Suas Lições de Programação
              </h2>
            </motion.div>

            {/* Lista de Exercícios */}
            {exercicios.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-16"
              >
                <div className="text-8xl mb-6">📚</div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Nenhuma lição disponível
                </h3>
                <p className="text-xl text-slate-600 dark:text-slate-400">
                  Aguarde enquanto preparamos suas lições
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {exercicios.map((exercicio, index) => (
                  <Link
                    key={exercicio.id}
                    href={`/aluno/licoes/${exercicio.id}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`rounded-2xl border p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                        exercicio.status === 'concluido'
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
                      }`}
                    >
                      {/* Header com status */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                          {exercicio.titulo}
                        </h3>
                        {exercicio.status === 'concluido' && (
                          <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full">
                            <span className="text-sm">✓</span>
                          </div>
                        )}
                      </div>

                      {/* Linguagem */}
                      <div className="mb-4">
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                          📝{' '}
                          {linguagensMap.get(exercicio.linguagem_id) ||
                            'Carregando...'}
                        </p>
                      </div>

                      {/* Status do exercício */}
                      <div className="mt-4">
                        {exercicio.status === 'concluido' && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <span className="text-lg">🎉</span>
                            <span className="font-semibold">Concluído!</span>
                          </div>
                        )}
                        {exercicio.status === 'em_andamento' && (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <span className="text-lg">⏳</span>
                            <span className="font-semibold">Em andamento</span>
                          </div>
                        )}
                        {exercicio.status === 'nao_iniciado' && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <span className="text-lg">📚</span>
                            <span className="font-semibold">Não iniciado</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
