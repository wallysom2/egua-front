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
import { Header } from '@/components/Header';
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
    const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();
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
        <>
            <Header
                variant="dashboard"
                user={user}
                onLogout={signOut}
                customTitle="Minhas Turmas"
                hideLogo={true}
                extraActions={
                    <>
                        <BackButton href="/dashboard" />
                        <Link
                            href="/dashboard/entrar-turma"
                            className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                        >
                            <KeyRound className="w-5 h-5" /> Entrar em Turma
                        </Link>
                    </>
                }
            />

            {/* Conteúdo Principal */}
            <main className="flex-1 flex items-center py-12 pt-24">
                <div className="container mx-auto px-6">

                    {/* Grid de Turmas */}
                    {turmas.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-lg mx-auto"
                        >
                            <div className="bg-white dark:bg-bg-secondary rounded-2xl p-10 shadow-xl border border-slate-200 dark:border-border-custom text-center">
                                {/* Ícone Animado */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                    className="w-24 h-24 bg-gradient-to-br from-brand-500/10 to-brand-600/10 rounded-full flex items-center justify-center mx-auto mb-8"
                                >
                                    <GraduationCap className="w-12 h-12 text-brand-500" />
                                </motion.div>

                                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-text-primary mb-3 tracking-tight">
                                    Você ainda não está em nenhuma turma
                                </h3>
                                <p className="text-slate-500 dark:text-text-secondary text-base mb-8 leading-relaxed">
                                    Peça o código de acesso ao seu professor e <Link href="/dashboard/entrar-turma" className="text-brand-600 dark:text-brand-500 font-semibold hover:underline">entre em uma turma</Link> para começar a aprender!
                                </p>

                                <Link
                                    href="/dashboard/entrar-turma"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all font-bold text-lg shadow-lg shadow-brand-500/20"
                                >
                                    <KeyRound className="w-5 h-5" /> Entrar em uma Turma
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-8 text-center"
                        >
                            {turmas.map((turma, index) => (
                                <DashboardCard
                                    key={turma.id}
                                    title={turma.nome}
                                    icon={GraduationCap}
                                    color="brand"
                                    href={`/dashboard/turma/${turma.id}`}
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

                                        {/* Botão de Ação (Visual apenas, card já é Link) */}
                                        <div
                                            className="w-full py-3 px-6 bg-gradient-to-r from-brand-500 to-brand-600 group-hover:from-brand-600 group-hover:to-brand-700 text-white rounded-xl transition-all font-bold text-base shadow-md flex items-center justify-center gap-2"
                                        >
                                            {turma.progresso.percentual === 0 ? <><Rocket className="w-4 h-4" /> Começar</> : <><Play className="w-4 h-4" /> Continuar</>}
                                        </div>
                                    </div>
                                </DashboardCard>
                            ))}
                        </motion.div>
                    )}
                </div>
            </main>
        </>
    );
}
