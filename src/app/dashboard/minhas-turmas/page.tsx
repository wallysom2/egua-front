'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface TurmaAluno {
    id: string;
    nome: string;
    descricao: string | null;
    matriculado_em: string;
    _count: {
        trilha_modulo: number;
    };
    progresso: {
        total: number;
        completadas: number;
        percentual: number;
        xp_total: number;
    };
}

export default function MinhasTurmasPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [turmas, setTurmas] = useState<TurmaAluno[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (authLoading || !isAuthenticated) {
            return;
        }

        const fetchTurmas = async () => {
            try {
                const data = await apiClient.get<TurmaAluno[]>('/turmas/minhas');
                setTurmas(data);
            } catch (error) {
                console.error('Erro ao carregar turmas:', error);
                setError('Não foi possível carregar suas turmas.');
            } finally {
                setLoading(false);
            }
        };

        fetchTurmas();
    }, [router, isAuthenticated, authLoading]);

    if (loading || authLoading) {
        return <Loading text="Carregando suas turmas..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-bg-primary">
                <div className="text-center py-16 bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom max-w-md mx-auto shadow-lg p-8">
                    <div className="text-6xl mb-6">⚠️</div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-4">
                        Erro ao carregar
                    </h2>
                    <p className="text-slate-600 dark:text-text-secondary mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        🔄 Tentar Novamente
                    </button>
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
                            <Link
                                href="/dashboard/entrar-turma"
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                            >
                                <span>🔑</span> Entrar em Turma
                            </Link>
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-2">
                            Minhas Turmas
                        </h1>
                        <p className="text-slate-600 dark:text-text-secondary">
                            Continue sua jornada de aprendizado
                        </p>
                    </motion.div>

                    {/* Grid de Turmas */}
                    {turmas.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom shadow-sm">
                            <div className="text-6xl mb-6">🎓</div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-4">
                                Você ainda não está em nenhuma turma
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 max-w-md mx-auto">
                                Peça o código de acesso ao seu professor e entre em uma turma para começar a aprender!
                            </p>
                            <Link
                                href="/dashboard/entrar-turma"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
                            >
                                🔑 Entrar em uma Turma
                            </Link>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            {turmas.map((turma, index) => (
                                <motion.div
                                    key={turma.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white dark:bg-bg-secondary rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-border-custom hover:border-green-300 dark:hover:border-green-500/50 transition-all hover:shadow-xl"
                                >
                                    {/* Header com Progresso */}
                                    <div className="relative h-24 bg-gradient-to-r from-green-500 to-emerald-600">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <p className="text-4xl font-bold">{turma.progresso.percentual}%</p>
                                                <p className="text-sm opacity-90">Progresso</p>
                                            </div>
                                        </div>
                                        {/* Barra de XP */}
                                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                                            <div
                                                className="h-full bg-yellow-400 transition-all duration-500"
                                                style={{ width: `${turma.progresso.percentual}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Corpo */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-2 line-clamp-1">
                                            {turma.nome}
                                        </h3>
                                        {turma.descricao && (
                                            <p className="text-slate-600 dark:text-text-secondary text-sm mb-4 line-clamp-2">
                                                {turma.descricao}
                                            </p>
                                        )}

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 mb-4 text-sm">
                                            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                                <span>⭐</span>
                                                <span className="font-bold">{turma.progresso.xp_total} XP</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                                <span>📚</span>
                                                <span>{turma._count.trilha_modulo} módulos</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                <span>✅</span>
                                                <span>{turma.progresso.completadas}/{turma.progresso.total}</span>
                                            </div>
                                        </div>

                                        {/* Botão */}
                                        <Link
                                            href={`/dashboard/turma/${turma.id}`}
                                            className="block w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-center font-medium transition-colors"
                                        >
                                            {turma.progresso.percentual === 0 ? '🚀 Começar' : '▶️ Continuar'}
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
