'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loading } from '@/components/Loading';

import { API_BASE_URL } from '@/config/api';

interface Exercicio {
  id: number;
  titulo: string;
  tipo: 'pratico' | 'quiz';
  linguagem_id: number;
}

interface Linguagem {
  id: number;
  nome: string;
}

type EditarExercicioProps = {
  params: Promise<{ id: string }>;
};

export default function EditarExercicio({ params }: EditarExercicioProps) {
  const router = useRouter();
  const [exercicio, setExercicio] = useState<Exercicio | null>(null);
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        const [exercicioResponse, linguagensResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/exercicios/${resolvedParams.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/linguagens`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!exercicioResponse.ok || !linguagensResponse.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const [exercicioData, linguagensData] = await Promise.all([
          exercicioResponse.json(),
          linguagensResponse.json(),
        ]);

        setExercicio(exercicioData);
        setLinguagens(linguagensData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Não foi possível carregar os dados do exercício.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercicio) return;

    const token = localStorage.getItem('token');
    try {
      const resolvedParams = await params;
      const response = await fetch(
        `${API_BASE_URL}/exercicios/${resolvedParams.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(exercicio),
        },
      );

      if (response.ok) {
        router.push('/dashboard/licoes');
      } else {
        throw new Error('Erro ao atualizar exercício');
      }
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error);
      setError('Não foi possível atualizar o exercício.');
    }
  };

  if (loading) {
    return <Loading text="Carregando..." />;
  }

  if (error || !exercicio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <p className="text-xl font-semibold text-red-400 mb-4">
          {error || 'Exercício não encontrado'}
        </p>
        <button
          onClick={() => router.push('/dashboard/licoes')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para Lições
        </button>
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
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <main className="flex-1 py-16 pt-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Editar Lição
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Atualize as informações da lição
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="titulo"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Título
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={exercicio.titulo}
                  onChange={(e) =>
                    setExercicio({ ...exercicio, titulo: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="tipo"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Tipo
                </label>
                <select
                  id="tipo"
                  value={exercicio.tipo}
                  onChange={(e) =>
                    setExercicio({
                      ...exercicio,
                      tipo: e.target.value as 'pratico' | 'quiz',
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="pratico">Prático</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="linguagem"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Linguagem
                </label>
                <select
                  id="linguagem"
                  value={exercicio.linguagem_id}
                  onChange={(e) =>
                    setExercicio({
                      ...exercicio,
                      linguagem_id: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {linguagens.map((linguagem) => (
                    <option key={linguagem.id} value={linguagem.id}>
                      {linguagem.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/licoes')}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
