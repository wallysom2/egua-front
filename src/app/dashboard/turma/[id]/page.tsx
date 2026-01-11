'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface Licao {
    id: string;
    exercicio: {
        id: number;
        titulo: string;
    };
    ordem: number;
    xp_recompensa: number;
    completada: boolean;
    pontuacao: number;
    xp_ganho: number;
    tentativas: number;
}

interface Modulo {
    id: string;
    titulo: string;
    descricao: string | null;
    icone: string | null;
    ordem: number;
    xp_recompensa: number;
    completado: boolean;
    licoes: Licao[];
}

interface Progresso {
    turma_id: string;
    aluno_id: string;
    estatisticas: {
        total_licoes: number;
        licoes_completadas: number;
        percentual: number;
        xp_total: number;
    };
    modulos: Modulo[];
}

export default function TurmaAlunoPage() {
    const router = useRouter();
    const params = useParams();
    const turmaId = params.id as string;
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [progresso, setProgresso] = useState<Progresso | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedModulo, setExpandedModulo] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (authLoading || !isAuthenticated) {
            return;
        }

        const fetchProgresso = async () => {
            try {
                const data = await apiClient.get<Progresso>(`/turmas/${turmaId}/meu-progresso`);
                setProgresso(data);
                // Expandir o primeiro módulo não completado por padrão
                const primeiroNaoCompleto = data.modulos.find((m) => !m.completado);
                if (primeiroNaoCompleto) {
                    setExpandedModulo(primeiroNaoCompleto.id);
                } else if (data.modulos.length > 0) {
                    setExpandedModulo(data.modulos[0].id);
                }
            } catch (error) {
                console.error('Erro ao carregar progresso:', error);
                setError('Você não está matriculado nesta turma.');
            } finally {
                setLoading(false);
            }
        };

        fetchProgresso();
    }, [router, turmaId, isAuthenticated, authLoading]);

    const getLicaoStatus = (licao: Licao, moduloIndex: number, licaoIndex: number, modulos: Modulo[]) => {
        if (licao.completada) return 'completada';

        // Verificar se a lição anterior foi completada
        if (licaoIndex === 0) {
            // Primeira lição do módulo
            if (moduloIndex === 0) {
                return 'disponivel'; // Primeira lição do primeiro módulo sempre disponível
            }
            // Verificar se o módulo anterior foi completado
            const moduloAnterior = modulos[moduloIndex - 1];
            if (moduloAnterior.completado) {
                return 'disponivel';
            }
            return 'bloqueada';
        } else {
            // Verificar lição anterior do mesmo módulo
            const modulo = modulos[moduloIndex];
            const licaoAnterior = modulo.licoes[licaoIndex - 1];
            if (licaoAnterior.completada) {
                return 'disponivel';
            }
            return 'bloqueada';
        }
    };

    if (loading || authLoading) {
        return <Loading text="Carregando sua trilha..." />;
    }

    if (error || !progresso) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-bg-primary">
                <div className="text-center py-16 bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom max-w-md mx-auto shadow-lg p-8">
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-4">
                        Acesso Restrito
                    </h2>
                    <p className="text-slate-600 dark:text-text-secondary mb-6">{error}</p>
                    <Link
                        href="/dashboard/minhas-turmas"
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-block"
                    >
                        ← Minhas Turmas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-bg-primary dark:via-bg-secondary dark:to-bg-primary text-slate-900 dark:text-text-primary transition-colors">
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
                            <BackButton href="/dashboard/minhas-turmas" />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Barra de XP e Progresso */}
            <div className="fixed top-20 left-0 right-0 z-30 bg-white/90 dark:bg-bg-secondary/90 backdrop-blur-sm border-b border-slate-200 dark:border-border-custom">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                <span className="text-xl">⭐</span>
                                <span className="font-bold text-yellow-700 dark:text-yellow-400">
                                    {progresso.estatisticas.xp_total} XP
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <span className="text-xl">✅</span>
                                <span className="font-bold text-green-700 dark:text-green-400">
                                    {progresso.estatisticas.licoes_completadas}/{progresso.estatisticas.total_licoes}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 max-w-xs ml-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-3 bg-slate-200 dark:bg-bg-tertiary rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progresso.estatisticas.percentual}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                    />
                                </div>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                    {progresso.estatisticas.percentual}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal - Trilha */}
            <main className="flex-1 py-16 pt-44">
                <div className="container mx-auto px-6 max-w-2xl">
                    {progresso.modulos.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom shadow-sm">
                            <div className="text-6xl mb-6">📚</div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-4">
                                Trilha em Construção
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary">
                                O professor ainda não configurou a trilha de aprendizado desta turma.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {progresso.modulos.map((modulo, moduloIndex) => {
                                const isExpanded = expandedModulo === modulo.id;
                                const licoesConcluidas = modulo.licoes.filter((l) => l.completada).length;

                                return (
                                    <motion.div
                                        key={modulo.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: moduloIndex * 0.1 }}
                                        className="bg-white dark:bg-bg-secondary rounded-2xl shadow-lg border border-slate-200 dark:border-border-custom overflow-hidden"
                                    >
                                        {/* Header do Módulo */}
                                        <button
                                            onClick={() => setExpandedModulo(isExpanded ? null : modulo.id)}
                                            className="w-full p-6 flex items-center gap-4 text-left hover:bg-slate-50 dark:hover:bg-bg-tertiary transition-colors"
                                        >
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-lg ${modulo.completado
                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                                    : 'bg-gradient-to-br from-purple-500 to-purple-600'
                                                }`}>
                                                {modulo.completado ? '✓' : modulo.icone || (moduloIndex + 1)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary">
                                                    {modulo.titulo}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-sm text-slate-600 dark:text-text-secondary">
                                                        {licoesConcluidas}/{modulo.licoes.length} lições
                                                    </span>
                                                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                                                        +{modulo.xp_recompensa} XP
                                                    </span>
                                                </div>
                                                {/* Mini barra de progresso */}
                                                <div className="mt-2 h-2 bg-slate-200 dark:bg-bg-tertiary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                                        style={{
                                                            width: `${modulo.licoes.length > 0 ? (licoesConcluidas / modulo.licoes.length) * 100 : 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                className="text-2xl text-slate-400"
                                            >
                                                ▼
                                            </motion.div>
                                        </button>

                                        {/* Lições do Módulo */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-6 pt-2 border-t border-slate-200 dark:border-border-custom">
                                                        {modulo.descricao && (
                                                            <p className="text-slate-600 dark:text-text-secondary mb-4">
                                                                {modulo.descricao}
                                                            </p>
                                                        )}

                                                        {/* Lista de Lições - Estlo Caminho */}
                                                        <div className="relative">
                                                            {/* Linha conectora */}
                                                            <div className="absolute left-8 top-8 bottom-8 w-1 bg-slate-200 dark:bg-border-custom" />

                                                            <div className="space-y-4">
                                                                {modulo.licoes.map((licao, licaoIndex) => {
                                                                    const status = getLicaoStatus(licao, moduloIndex, licaoIndex, progresso.modulos);

                                                                    return (
                                                                        <motion.div
                                                                            key={licao.id}
                                                                            initial={{ opacity: 0, x: -20 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: licaoIndex * 0.05 }}
                                                                            className="relative"
                                                                        >
                                                                            {status === 'disponivel' || status === 'completada' ? (
                                                                                <Link
                                                                                    href={`/dashboard/licoes/${licao.exercicio.id}`}
                                                                                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${status === 'completada'
                                                                                            ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
                                                                                            : 'bg-slate-50 dark:bg-bg-tertiary border-2 border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg'
                                                                                        }`}
                                                                                >
                                                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl z-10 ${status === 'completada'
                                                                                            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                                                                            : 'bg-gradient-to-br from-purple-500 to-purple-600 animate-pulse'
                                                                                        }`}>
                                                                                        {status === 'completada' ? '✓' : '▶'}
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <p className="font-medium text-slate-900 dark:text-text-primary">
                                                                                            {licao.exercicio.titulo}
                                                                                        </p>
                                                                                        <div className="flex items-center gap-3 mt-1">
                                                                                            <span className="text-sm text-yellow-600 dark:text-yellow-400">
                                                                                                +{licao.xp_recompensa} XP
                                                                                            </span>
                                                                                            {licao.completada && (
                                                                                                <span className="text-sm text-green-600 dark:text-green-400">
                                                                                                    {licao.pontuacao}% • {licao.xp_ganho} XP ganhos
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    {status === 'disponivel' && (
                                                                                        <span className="text-purple-500 text-2xl">→</span>
                                                                                    )}
                                                                                </Link>
                                                                            ) : (
                                                                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-bg-tertiary/50 border-2 border-slate-200 dark:border-border-custom opacity-60">
                                                                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-300 dark:bg-slate-600 text-white text-xl z-10">
                                                                                        🔒
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <p className="font-medium text-slate-500 dark:text-slate-400">
                                                                                            {licao.exercicio.titulo}
                                                                                        </p>
                                                                                        <p className="text-sm text-slate-400 dark:text-slate-500">
                                                                                            Complete a lição anterior
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
