'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, ArrowLeft, Check, Copy, Pencil, Users, FileText, Target } from 'lucide-react';
import { Header } from '@/components/Header';
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
    trilha_modulo: TrilhaModulo[];
}

interface TrilhaModulo {
    id: string;
    titulo: string;
    descricao: string | null;
    icone: string | null;
    ordem: number;
    xp_recompensa: number;
    trilha_licao: TrilhaLicao[];
}

interface TrilhaLicao {
    id: string;
    ordem: number;
    xp_recompensa: number;
    exercicio: {
        id: number;
        titulo: string;
    };
}

interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    description?: string;
}

export default function TurmaDetalhesPage() {
    const router = useRouter();
    const params = useParams();
    const turmaId = params.id as string;
    const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();

    const [turma, setTurma] = useState<Turma | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [copiedCode, setCopiedCode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editNome, setEditNome] = useState('');
    const [saving, setSaving] = useState(false);

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

    const copyToClipboard = async () => {
        if (!turma) return;
        try {
            await navigator.clipboard.writeText(turma.codigo_acesso);
            setCopiedCode(true);
            addToast({
                type: 'success',
                message: 'Código copiado!',
                description: 'Compartilhe com seus alunos',
            });
            setTimeout(() => setCopiedCode(false), 2000);
        } catch {
            addToast({
                type: 'error',
                message: 'Erro ao copiar',
            });
        }
    };

    const handleSave = async () => {
        if (!turma) return;
        setSaving(true);
        try {
            await apiClient.put(`/turmas/${turma.id}`, {
                nome: editNome,
            });
            setTurma({
                ...turma,
                nome: editNome,
            });
            setEditMode(false);
            addToast({
                type: 'success',
                message: 'Turma atualizada!',
            });
        } catch {
            addToast({
                type: 'error',
                message: 'Erro ao salvar alterações',
            });
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (authLoading || !isAuthenticated) {
            return;
        }

        const fetchTurma = async () => {
            try {
                const data = await apiClient.get<Turma>(`/turmas/${turmaId}`);
                setTurma(data);
                setEditNome(data.nome);
            } catch (error) {
                console.error('Erro ao carregar turma:', error);
                setError('Turma não encontrada ou você não tem permissão.');
            } finally {
                setLoading(false);
            }
        };

        fetchTurma();
    }, [router, turmaId, isAuthenticated, authLoading]);

    if (loading || authLoading) {
        return <Loading text="Carregando turma..." />;
    }

    if (error || !turma) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-bg-primary">
                <div className="text-center py-16 bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom max-w-md mx-auto shadow-lg p-8">
                    <div className="text-6xl mb-6"><XCircle className="w-16 h-16 mx-auto text-red-500" /></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-4">
                        Turma não encontrada
                    </h2>
                    <p className="text-slate-600 dark:text-text-secondary mb-6">{error}</p>
                    <Link
                        href="/dashboard/turmas"
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" /> Voltar para Turmas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-bg-primary dark:via-bg-secondary dark:to-bg-primary text-slate-900 dark:text-text-primary transition-colors">
            <Header
                variant="dashboard"
                user={user}
                onLogout={signOut}
                extraActions={
                    <BackButton href="/dashboard/turmas" />
                }
            />

            {/* Conteúdo Principal */}
            <main className="flex-grow flex items-center py-20">
                <div className="container mx-auto px-6">
                    {/* Header da Turma - Simplificado */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 text-center"
                    >
                        {editMode ? (
                            <div className="max-w-md mx-auto space-y-4">
                                <input
                                    type="text"
                                    value={editNome}
                                    onChange={(e) => setEditNome(e.target.value)}
                                    className="w-full text-2xl font-bold px-4 py-3 bg-white dark:bg-bg-secondary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary text-center"
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || editNome.length < 3}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? 'Salvando...' : <><Check className="w-4 h-4" /> Salvar</>}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditMode(false);
                                            setEditNome(turma.nome);
                                        }}
                                        className="px-6 py-2 bg-slate-200 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-text-primary">
                                        {turma.nome}
                                    </h1>
                                    {canManage && (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="p-2 text-slate-400 hover:text-orange-600 transition-colors"
                                            title="Editar nome"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Código de Acesso Inline */}
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-bg-tertiary rounded-lg">
                                    <span className="text-sm text-slate-500 dark:text-text-secondary">Código:</span>
                                    <span className="font-mono font-bold text-lg text-slate-900 dark:text-text-primary tracking-wider">
                                        {turma.codigo_acesso}
                                    </span>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`p-2 rounded-lg transition-colors ${copiedCode
                                            ? 'bg-green-500 text-white'
                                            : 'bg-slate-200 dark:bg-bg-secondary hover:bg-slate-300 dark:hover:bg-border-hover text-slate-600 dark:text-text-secondary'
                                            }`}
                                        title="Copiar código"
                                    >
                                        {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Cards de Ações - Estilo Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Gerenciar Alunos */}
                        <Link href={`/dashboard/turmas/${turma.id}/alunos`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="group bg-white dark:bg-bg-secondary rounded-2xl p-10 shadow-lg border border-slate-200 dark:border-border-custom hover:border-blue-300 dark:hover:border-blue-500/50 transition-all hover:shadow-2xl cursor-pointer flex flex-col items-center justify-center min-h-[280px]"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 transition-transform shadow-lg shadow-blue-500/20">
                                    <Users className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-text-primary text-center">
                                    Alunos
                                </h3>
                            </motion.div>
                        </Link>

                        {/* Gerenciar Exercícios */}
                        <Link href={`/dashboard/turmas/${turma.id}/exercicios`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="group bg-white dark:bg-bg-secondary rounded-2xl p-10 shadow-lg border border-slate-200 dark:border-border-custom hover:border-green-300 dark:hover:border-green-500/50 transition-all hover:shadow-2xl cursor-pointer flex flex-col items-center justify-center min-h-[280px]"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 transition-transform shadow-lg shadow-green-500/20">
                                    <FileText className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-text-primary text-center">
                                    Exercícios
                                </h3>
                            </motion.div>
                        </Link>

                        {/* Trilha de Aprendizado */}
                        <Link href={`/dashboard/turmas/${turma.id}/trilha`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="group bg-white dark:bg-bg-secondary rounded-2xl p-10 shadow-lg border border-slate-200 dark:border-border-custom hover:border-purple-300 dark:hover:border-purple-500/50 transition-all hover:shadow-2xl cursor-pointer flex flex-col items-center justify-center min-h-[280px]"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 transition-transform shadow-lg shadow-purple-500/20">
                                    <Target className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-text-primary text-center">
                                    Trilha
                                </h3>
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-200 dark:footer-border-custom bg-slate-50/30 footer-bg mt-auto">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-slate-600 dark:text-text-secondary">
                        Senior Code AI
                    </p>
                </div>
            </footer>

            {/* Toast Notifications */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className={`p-4 rounded-lg shadow-lg border ${toast.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                                : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                                }`}
                        >
                            <p className={`font-medium ${toast.type === 'success'
                                ? 'text-green-800 dark:text-green-300'
                                : 'text-red-800 dark:text-red-300'
                                }`}>
                                {toast.message}
                            </p>
                            {toast.description && (
                                <p className={`text-sm ${toast.type === 'success'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
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

