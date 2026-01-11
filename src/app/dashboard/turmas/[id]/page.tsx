'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, XCircle, ArrowLeft, Check, Copy, Pencil, Users, FileText, Target } from 'lucide-react';
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
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [turma, setTurma] = useState<Turma | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [copiedCode, setCopiedCode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editNome, setEditNome] = useState('');
    const [editDescricao, setEditDescricao] = useState('');
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
        } catch (err) {
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
                descricao: editDescricao || undefined,
            });
            setTurma({
                ...turma,
                nome: editNome,
                descricao: editDescricao,
            });
            setEditMode(false);
            addToast({
                type: 'success',
                message: 'Turma atualizada!',
            });
        } catch (err) {
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
                setEditDescricao(data.descricao || '');
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
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors inline-block"
                    >
                        <ArrowLeft className="w-5 h-5" /> Voltar para Turmas
                    </Link>
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
                            <BackButton href="/dashboard/turmas" />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Conteúdo Principal */}
            <main className="flex-1 py-16 pt-32">
                <div className="container mx-auto px-6">
                    {/* Header da Turma */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom mb-8"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                            {/* Info Principal */}
                            <div className="flex-1">
                                {editMode ? (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={editNome}
                                            onChange={(e) => setEditNome(e.target.value)}
                                            className="w-full text-2xl font-bold px-4 py-2 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary"
                                        />
                                        <textarea
                                            value={editDescricao}
                                            onChange={(e) => setEditDescricao(e.target.value)}
                                            placeholder="Descrição da turma..."
                                            rows={3}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary resize-none"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                {saving ? 'Salvando...' : <><Check className="w-4 h-4" /> Salvar</>}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditMode(false);
                                                    setEditNome(turma.nome);
                                                    setEditDescricao(turma.descricao || '');
                                                }}
                                                className="px-4 py-2 bg-slate-200 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                                <BookOpen className="w-8 h-8" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-text-primary">
                                                        {turma.nome}
                                                    </h1>
                                                    {canManage && (
                                                        <button
                                                            onClick={() => setEditMode(true)}
                                                            className="p-2 text-slate-500 hover:text-orange-600 transition-colors"
                                                            title="Editar turma"
                                                        >
                                                            <Pencil className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                                {turma.descricao && (
                                                    <p className="text-slate-600 dark:text-text-secondary mt-2">
                                                        {turma.descricao}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Código de Acesso */}
                            <div className="lg:w-80 p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-xl">
                                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-2">
                                    Código de Acesso da Turma
                                </p>
                                <div className="flex items-center gap-3">
                                    <p className="font-mono text-3xl font-bold text-orange-600 dark:text-orange-400 tracking-widest flex-1">
                                        {turma.codigo_acesso}
                                    </p>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`p-3 rounded-lg transition-colors ${copiedCode
                                            ? 'bg-green-500 text-white'
                                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                                            }`}
                                        title="Copiar código"
                                    >
                                        {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-border-custom">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {turma._count.turma_aluno}
                                </p>
                                <p className="text-slate-600 dark:text-text-secondary">Alunos Matriculados</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {turma._count.turma_exercicio}
                                </p>
                                <p className="text-slate-600 dark:text-text-secondary">Exercícios</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {turma._count.trilha_modulo}
                                </p>
                                <p className="text-slate-600 dark:text-text-secondary">Módulos na Trilha</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Cards de Ações */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Gerenciar Alunos */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-bg-secondary rounded-xl p-6 shadow-lg border border-slate-200 dark:border-border-custom hover:border-blue-300 dark:hover:border-blue-500/50 transition-all"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-4">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-2">
                                Alunos
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary mb-4">
                                Veja os alunos matriculados e acompanhe o progresso deles
                            </p>
                            <Link
                                href={`/dashboard/turmas/${turma.id}/alunos`}
                                className="block w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-center font-medium transition-colors"
                            >
                                Gerenciar Alunos
                            </Link>
                        </motion.div>

                        {/* Gerenciar Exercícios */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-bg-secondary rounded-xl p-6 shadow-lg border border-slate-200 dark:border-border-custom hover:border-green-300 dark:hover:border-green-500/50 transition-all"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white mb-4">
                                <FileText className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-2">
                                Exercícios
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary mb-4">
                                Adicione exercícios personalizados para esta turma
                            </p>
                            <Link
                                href={`/dashboard/turmas/${turma.id}/exercicios`}
                                className="block w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-center font-medium transition-colors"
                            >
                                Gerenciar Exercícios
                            </Link>
                        </motion.div>

                        {/* Trilha de Aprendizado */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-bg-secondary rounded-xl p-6 shadow-lg border border-slate-200 dark:border-border-custom hover:border-purple-300 dark:hover:border-purple-500/50 transition-all"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4">
                                <Target className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-2">
                                Trilha de Aprendizado
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary mb-4">
                                Configure módulos e lições no estilo Duolingo
                            </p>
                            <Link
                                href={`/dashboard/turmas/${turma.id}/trilha`}
                                className="block w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg text-center font-medium transition-colors"
                            >
                                Configurar Trilha
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </main>

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
