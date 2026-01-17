'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Rocket, ArrowLeft, Lightbulb, Check, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface EntrarTurmaResponse {
    success: boolean;
    message: string;
    turma?: {
        id: string;
        nome: string;
    };
}

export default function EntrarTurmaPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-bg-primary">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <EntrarTurmaContent />
        </Suspense>
    );
}

function EntrarTurmaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ turmaId: string; turmaNome: string } | null>(null);

    useEffect(() => {
        const codigoUrl = searchParams.get('codigo');
        if (codigoUrl && (codigoUrl.length === 4 || codigoUrl.length === 8) && isAuthenticated) {
            setCodigo(codigoUrl.toUpperCase());
            handleJoinTurma(codigoUrl.toUpperCase());
        }
    }, [searchParams, isAuthenticated]);

    const handleJoinTurma = async (codigoAcesso: string) => {
        setError(null);
        setLoading(true);

        try {
            const response = await apiClient.post<EntrarTurmaResponse>('/turmas/entrar', {
                codigo_acesso: codigoAcesso.toUpperCase().trim(),
            });

            if (response.success && response.turma) {
                setSuccess({
                    turmaId: response.turma.id,
                    turmaNome: response.turma.nome,
                });
            } else {
                setError(response.message || 'Erro ao entrar na turma');
            }
        } catch (err: any) {
            console.error('Erro ao entrar na turma:', err);
            setError(err.message || 'Código inválido ou turma não encontrada');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        handleJoinTurma(codigo);
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
        setCodigo(value);
        setError(null);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-bg-primary">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    return (
        <>
            <Header
                variant="dashboard"
                user={user}
                onLogout={signOut}
                customTitle="Entrar em Turma"
                hideLogo={true}
                extraActions={
                    <BackButton href="/dashboard/minhas-turmas" />
                }
            />

            {/* Conteúdo Principal */}
            <main className="flex-1 py-12 pt-24 flex items-center justify-center">
                <div className="container mx-auto px-6 max-w-md">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center"
                            >
                                <div className="bg-white dark:bg-bg-secondary rounded-2xl p-10 shadow-xl border border-slate-200 dark:border-border-custom">
                                    {/* Ícone de Sucesso com Animação */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                        className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-brand-500/30"
                                    >
                                        <Check className="w-12 h-12 text-white" strokeWidth={3} />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-text-primary mb-3 tracking-tight">
                                            Matrícula Realizada!
                                        </h1>
                                        <p className="text-slate-600 dark:text-text-secondary mb-8 text-lg">
                                            Você entrou na turma <span className="font-bold text-brand-600 dark:text-brand-500">{success.turmaNome}</span>
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex flex-col gap-3"
                                    >
                                        <Link
                                            href={`/dashboard/turma/${success.turmaId}`}
                                            className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 text-lg"
                                        >
                                            <Sparkles className="w-5 h-5" /> Começar a Estudar
                                        </Link>
                                        <Link
                                            href="/dashboard/minhas-turmas"
                                            className="w-full py-4 bg-slate-100 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-xl hover:bg-slate-200 dark:hover:bg-border-hover font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-5 h-5" /> Minhas Turmas
                                        </Link>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                {/* Card Principal */}
                                <div className="bg-white dark:bg-bg-secondary rounded-2xl p-10 shadow-xl border border-slate-200 dark:border-border-custom">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-gradient-to-br from-brand-500/10 to-brand-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <KeyRound className="w-8 h-8 text-brand-600" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-2">
                                            Digite seu Código
                                        </h1>
                                        <p className="text-slate-500 dark:text-text-secondary text-sm">
                                            O código de 4 caracteres fornecido pelo seu professor
                                        </p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Campo de Código */}
                                        <div>
                                            <label
                                                htmlFor="codigo"
                                                className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2"
                                            >
                                                Código de Acesso
                                            </label>
                                            <input
                                                id="codigo"
                                                type="text"
                                                value={codigo}
                                                onChange={handleCodeChange}
                                                placeholder="••••"
                                                required
                                                className="w-full px-4 py-5 bg-slate-50 dark:bg-bg-tertiary border-2 border-slate-100 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary placeholder-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-center text-4xl font-mono tracking-[0.5em] uppercase shadow-inner"
                                            />
                                            <div className="flex justify-between items-center mt-3 px-1">
                                                <p className="text-xs font-semibold text-slate-400 dark:text-text-tertiary uppercase tracking-wider">
                                                    Status: {codigo.length === 4 ? 'Pronto' : 'Incompleto'}
                                                </p>
                                                <p className="text-xs font-bold text-brand-600 dark:text-brand-500">
                                                    {codigo.length}/4
                                                </p>
                                            </div>
                                        </div>

                                        {/* Erro */}
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg"
                                            >
                                                <p className="text-red-700 dark:text-red-300 text-center">{error}</p>
                                            </motion.div>
                                        )}

                                        {/* Botão */}
                                        <button
                                            type="submit"
                                            disabled={loading || codigo.length !== 4}
                                            className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Verificando...
                                                </>
                                            ) : (
                                                <>
                                                    <Rocket className="w-5 h-5" /> Entrar na Turma
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Link de Ajuda mais sutil */}
                                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border-custom flex items-center justify-center">
                                        <div className="flex items-center gap-2 text-slate-400 dark:text-text-tertiary hover:text-brand-600 dark:hover:text-brand-500 cursor-help transition-colors group">
                                            <Lightbulb className="w-4 h-4" />
                                            <span className="text-sm font-medium">Onde consigo o código?</span>
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl text-center">
                                                Peça ao seu professor o código de acesso de 4 caracteres da sua turma.
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </>
    );
}
