'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface Turma {
    id: string;
    nome: string;
    descricao: string | null;
    codigo_acesso: string;
    professor_id: string;
    ativo: boolean;
    created_at: string;
    _count: {
        turma_aluno: number;
        turma_exercicio: number;
        trilha_modulo: number;
    };
}

interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    description?: string;
}

export default function TurmasPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const isProfessor = user?.tipo === 'professor';
    const isDesenvolvedor = user?.tipo === 'desenvolvedor';
    const canManage = isProfessor || isDesenvolvedor;

    const addToast = (toast: Omit<ToastNotification, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    };

    const copyToClipboard = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            addToast({
                type: 'success',
                message: 'Código copiado!',
                description: 'Compartilhe com seus alunos',
            });
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            addToast({
                type: 'error',
                message: 'Erro ao copiar',
                description: 'Tente novamente',
            });
        }
    };

    const handleDeleteTurma = async (turmaId: string) => {
        setDeleting(true);
        try {
            await apiClient.delete(`/turmas/${turmaId}`);
            setTurmas(turmas.filter((t) => t.id !== turmaId));
            addToast({
                type: 'success',
                message: 'Turma desativada!',
                description: 'A turma foi removida com sucesso',
            });
        } catch (error) {
            console.error('Erro ao desativar turma:', error);
            addToast({
                type: 'error',
                message: 'Erro ao desativar turma',
                description: 'Tente novamente mais tarde',
            });
        } finally {
            setDeleting(false);
            setShowDeleteModal(null);
        }
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!authLoading && !canManage) {
            router.push('/dashboard/minhas-turmas');
            return;
        }

        if (authLoading || !isAuthenticated) {
            return;
        }

        const fetchTurmas = async () => {
            try {
                const data = await apiClient.get<Turma[]>('/turmas');
                setTurmas(data);
            } catch (error) {
                console.error('Erro ao carregar turmas:', error);
                setError('Não foi possível carregar as turmas.');
            } finally {
                setLoading(false);
            }
        };

        fetchTurmas();
    }, [router, isAuthenticated, authLoading, canManage]);

    if (loading || authLoading) {
        return <Loading text="Carregando turmas..." />;
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
                                href="/dashboard/turmas/criar"
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                            >
                                <span>➕</span> Nova Turma
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
                            Gerencie suas turmas e acompanhe o progresso dos alunos
                        </p>
                    </motion.div>

                    {/* Grid de Turmas */}
                    {turmas.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom shadow-sm">
                            <div className="text-6xl mb-6">📚</div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-4">
                                Nenhuma turma criada
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 max-w-md mx-auto">
                                Crie sua primeira turma para começar a organizar seus alunos e exercícios
                            </p>
                            <Link
                                href="/dashboard/turmas/criar"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors"
                            >
                                ➕ Criar Primeira Turma
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
                                    className="group bg-white dark:bg-bg-secondary rounded-xl p-6 shadow-lg border border-slate-200 dark:border-border-custom hover:border-orange-300 dark:hover:border-orange-500/50 transition-all hover:shadow-xl"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-1 line-clamp-1">
                                                {turma.nome}
                                            </h3>
                                            {turma.descricao && (
                                                <p className="text-slate-600 dark:text-text-secondary text-sm line-clamp-2">
                                                    {turma.descricao}
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-xl">
                                            📖
                                        </div>
                                    </div>

                                    {/* Código de Acesso */}
                                    <div className="mb-4 p-3 bg-slate-100 dark:bg-bg-tertiary rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-text-secondary mb-1">
                                                    Código de Acesso
                                                </p>
                                                <p className="font-mono font-bold text-lg text-slate-900 dark:text-text-primary tracking-wider">
                                                    {turma.codigo_acesso}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(turma.codigo_acesso)}
                                                className={`p-2 rounded-lg transition-colors ${copiedCode === turma.codigo_acesso
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-slate-200 dark:bg-bg-secondary hover:bg-slate-300 dark:hover:bg-border-hover text-slate-700 dark:text-text-secondary'
                                                    }`}
                                                title="Copiar código"
                                            >
                                                {copiedCode === turma.codigo_acesso ? '✓' : '📋'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Estatísticas */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                {turma._count.turma_aluno}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-text-secondary">Alunos</p>
                                        </div>
                                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                                {turma._count.turma_exercicio}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-text-secondary">Exercícios</p>
                                        </div>
                                        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                                {turma._count.trilha_modulo}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-text-secondary">Módulos</p>
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dashboard/turmas/${turma.id}`}
                                            className="flex-1 py-2 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-center font-medium transition-colors"
                                        >
                                            Gerenciar
                                        </Link>
                                        <button
                                            onClick={() => setShowDeleteModal(turma.id)}
                                            className="py-2 px-4 bg-slate-200 dark:bg-bg-tertiary hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-700 dark:text-text-secondary hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                                            title="Desativar turma"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Modal de Confirmação de Exclusão */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-2">
                                    Desativar Turma
                                </h3>
                                <p className="text-slate-600 dark:text-text-secondary mb-6">
                                    Tem certeza que deseja desativar esta turma? Os alunos não poderão mais acessá-la.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(null)}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 bg-slate-200 dark:bg-bg-tertiary text-slate-900 dark:text-text-primary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTurma(showDeleteModal)}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {deleting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Desativando...
                                            </>
                                        ) : (
                                            '🗑️ Desativar'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className={`p-4 rounded-lg shadow-lg border ${toast.type === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                                    : toast.type === 'error'
                                        ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                                        : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                                }`}
                        >
                            <p className={`font-medium ${toast.type === 'success'
                                    ? 'text-green-800 dark:text-green-300'
                                    : toast.type === 'error'
                                        ? 'text-red-800 dark:text-red-300'
                                        : 'text-blue-800 dark:text-blue-300'
                                }`}>
                                {toast.message}
                            </p>
                            {toast.description && (
                                <p className={`text-sm ${toast.type === 'success'
                                        ? 'text-green-600 dark:text-green-400'
                                        : toast.type === 'error'
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-blue-600 dark:text-blue-400'
                                    }`}>
                                    {toast.description}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
