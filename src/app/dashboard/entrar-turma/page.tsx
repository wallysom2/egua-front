'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Rocket, ArrowLeft, Lightbulb, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    const { isAuthenticated, isLoading: authLoading } = useAuth();
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
                            <BackButton href="/dashboard/minhas-turmas" />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Conteúdo Principal */}
            <main className="flex-1 py-16 pt-32 flex items-center justify-center">
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
                                <div className="bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom">
                                    <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                                        <Check className="w-12 h-12" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-2">
                                        Matrícula Realizada!
                                    </h1>
                                    <p className="text-slate-600 dark:text-text-secondary mb-6">
                                        Você entrou na turma <strong>{success.turmaNome}</strong>
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <Link
                                            href={`/dashboard/turma/${success.turmaId}`}
                                            className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg font-medium transition-colors"
                                        >
                                            <Rocket className="w-5 h-5" /> Começar a Estudar
                                        </Link>
                                        <Link
                                            href="/dashboard/minhas-turmas"
                                            className="w-full py-3 bg-slate-200 dark:bg-bg-tertiary text-slate-900 dark:text-text-primary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover font-medium transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" /> Minhas Turmas
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-3xl shadow-lg">
                                        <KeyRound className="w-10 h-10" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-2">
                                        Entrar em uma Turma
                                    </h1>
                                    <p className="text-slate-600 dark:text-text-secondary">
                                        Digite o código de acesso fornecido pelo professor
                                    </p>
                                </div>

                                {/* Formulário */}
                                <div className="bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom">
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
                                                placeholder="XXXXXXXX"
                                                required
                                                className="w-full px-4 py-4 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-[0.5em] uppercase"
                                                style={{ letterSpacing: '0.3em' }}
                                            />
                                            <p className="mt-2 text-sm text-slate-500 dark:text-text-secondary text-center">
                                                {codigo.length}/4 caracteres
                                            </p>
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
                                </div>

                                {/* Info */}
                                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                    <div className="flex gap-3">
                                        <Lightbulb className="w-6 h-6 text-blue-500" />
                                        <div>
                                            <p className="text-blue-800 dark:text-blue-300 font-medium">
                                                Onde consigo o código?
                                            </p>
                                            <p className="text-blue-600 dark:text-blue-400 text-sm">
                                                Peça ao seu professor o código de acesso da turma. É um código de 4 caracteres.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
