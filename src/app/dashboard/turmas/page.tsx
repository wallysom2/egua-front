'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, AlertTriangle, RefreshCw, Copy, Check, Trash2, QrCode, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { BackButton } from '@/components/BackButton';
import { DashboardCard } from '@/components/DashboardCard';
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
    const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [showQrModal, setShowQrModal] = useState<Turma | null>(null);

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
        } catch {
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
                    <div className="text-6xl mb-6"><AlertTriangle className="w-16 h-16 mx-auto text-amber-500" /></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-4">
                        Erro ao carregar
                    </h2>
                    <p className="text-slate-600 dark:text-text-secondary mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 mx-auto"
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
                extraActions={
                    <>
                        <BackButton href="/dashboard" />
                        <Link
                            href="/dashboard/turmas/criar"
                            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nova Turma</span>
                        </Link>
                    </>
                }
            />

            {/* Conteúdo Principal */}
            <main className="flex-grow flex items-center py-8 sm:py-12 pt-20 sm:pt-24">
                <div className="container mx-auto px-6">
                    {/* Grid de Turmas */}
                    {turmas.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                                    Nenhuma turma ainda
                                </h3>
                                <p className="text-slate-600 dark:text-text-secondary text-lg mb-8 leading-relaxed">
                                    Crie sua primeira turma para começar a organizar seus alunos.
                                </p>
                                <Link
                                    href="/dashboard/turmas/criar"
                                    className="inline-flex items-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg transition-all font-medium text-lg justify-center"
                                >
                                    <Plus className="w-5 h-5" /> Criar Primeira Turma
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {turmas.map((turma, index) => (
                                <DashboardCard
                                    key={turma.id}
                                    title={turma.nome}
                                    icon={Users}
                                    color="brand"
                                    href={`/dashboard/turmas/${turma.id}`}
                                    delay={index * 0.1}
                                >
                                    {/* Código de Acesso */}
                                    <div
                                        className="inline-flex items-center gap-2 px-3 py-4 bg-slate-100 dark:bg-bg-tertiary rounded-lg mt-8"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span className="font-mono font-bold text-slate-900 dark:text-text-primary tracking-wider">
                                            {turma.codigo_acesso}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                copyToClipboard(turma.codigo_acesso);
                                            }}
                                            className={`p-1.5 rounded transition-colors ${copiedCode === turma.codigo_acesso
                                                ? 'bg-green-500 text-white'
                                                : 'bg-slate-200 dark:bg-bg-secondary hover:bg-slate-300 dark:hover:bg-border-hover text-slate-600 dark:text-text-secondary'
                                                }`}
                                            title="Copiar código"
                                        >
                                            {copiedCode === turma.codigo_acesso ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowQrModal(turma);
                                            }}
                                            className="p-1.5 bg-slate-200 dark:bg-bg-secondary hover:bg-slate-300 dark:hover:bg-border-hover text-slate-600 dark:text-text-secondary rounded transition-colors"
                                            title="Gerar QR Code"
                                        >
                                            <QrCode className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </DashboardCard>
                            ))}
                        </div>
                    )}
                </div>
            </main>



            {/* Modal de QR Code */}
            <AnimatePresence>
                {showQrModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-bg-secondary rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-border-custom"
                        >
                            <div className="p-6 text-center">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary">
                                        QR Code de Matrícula
                                    </h3>
                                    <button
                                        onClick={() => setShowQrModal(null)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-bg-tertiary rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>

                                <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-inner">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                            typeof window !== 'undefined'
                                                ? `${window.location.origin}/dashboard/entrar-turma?codigo=${showQrModal.codigo_acesso}`
                                                : ''
                                        )}`}
                                        alt="QR Code de Matrícula"
                                        className="w-48 h-48 mx-auto"
                                    />
                                </div>

                                <p className="text-slate-600 dark:text-text-secondary mb-2 font-medium">
                                    Turma: <span className="text-brand-600">{showQrModal.nome}</span>
                                </p>

                                <div className="flex flex-col gap-2">
                                    <div className="py-3 bg-slate-100 dark:bg-bg-tertiary rounded-lg font-mono font-bold text-lg text-slate-900 dark:text-text-primary tracking-widest uppercase">
                                        {showQrModal.codigo_acesso}
                                    </div>
                                    <button
                                        onClick={() => setShowQrModal(null)}
                                        className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg transition-all font-medium"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                <div className="text-6xl mb-4"><AlertTriangle className="w-16 h-16 mx-auto text-amber-500" /></div>
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
                                            <><Trash2 className="w-4 h-4" /> Desativar</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
        </>
    );
}

