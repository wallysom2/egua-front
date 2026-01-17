'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { KeyRound, AlertTriangle, RefreshCw, GraduationCap, Star, BookOpen, CheckCircle, Rocket, Play } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { DashboardCard } from '@/components/DashboardCard';
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
                    <div className="text-6xl mb-6"><AlertTriangle className="w-16 h-16 mx-auto text-amber-500" /></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-4">
                        Erro ao carregar
                    </h2>
                    <p className="text-slate-600 dark:text-text-secondary mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" /> Tentar Novamente
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
                                className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                            >
                                <KeyRound className="w-5 h-5" /> Entrar em Turma
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
                            <div className="text-6xl mb-6"><GraduationCap className="w-16 h-16 mx-auto text-slate-400" /></div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-4">
                                Você ainda não está em nenhuma turma
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 max-w-md mx-auto">
                                Peça o código de acesso ao seu professor e entre em uma turma para começar a aprender!
                            </p>
                            <Link
                                href="/dashboard/entrar-turma"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-colors"
                            >
                                <KeyRound className="w-5 h-5" /> Entrar em uma Turma
                            </Link>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                        >
                            {turmas.map((turma, index) => (
                                <DashboardCard
                                    key={turma.id}
                                    title={turma.nome}
                                    icon={GraduationCap}
                                    color="brand"
                                    delay={index * 0.1}
                                >
                                    {/* Overlay de Progresso (Sutil) */}
                                    <div
                                        className="absolute bottom-0 left-0 h-1 bg-brand-500 transition-all duration-500"
                                        style={{ width: `${turma.progresso.percentual}%` }}
                                    />

                                    {/* Badge de Progresso */}
                                    <div className="absolute top-4 right-4 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                        {turma.progresso.percentual}%
                                    </div>

                                    <div className="flex flex-col items-center w-full">
                                        {/* Stats */}
                                        <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-sm">
                                            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-bold">
                                                <Star className="w-4 h-4" />
                                                <span>{turma.progresso.xp_total} XP</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500 dark:text-text-secondary">
                                                <BookOpen className="w-4 h-4" />
                                                <span>{turma._count.trilha_modulo} mod</span>
                                            </div>
                                        </div>

                                        {/* Botão de Ação */}
                                        <Link
                                            href={`/dashboard/turma/${turma.id}`}
                                            className="w-full py-3 px-6 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl transition-all font-bold text-base shadow-md flex items-center justify-center gap-2"
                                        >
                                            {turma.progresso.percentual === 0 ? <><Rocket className="w-4 h-4" /> Começar</> : <><Play className="w-4 h-4" /> Continuar</>}
                                        </Link>
                                    </div>
                                </DashboardCard>
                            ))}
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
