'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, Loader, Users, Inbox, AlertTriangle, ChevronRight, GraduationCap } from 'lucide-react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface AlunoEstatisticas {
    id: string;
    aluno_id: string;
    matriculado_em: string;
    usuario: {
        nome: string;
        email: string;
        avatar_url: string | null;
    };
    estatisticas: {
        licoes_completadas: number;
        total_licoes: number;
        percentual: number;
        xp_total: number;
    };
}

interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    description?: string;
}

export default function AlunosTurmaPage() {
    const router = useRouter();
    const params = useParams();
    const turmaId = params.id as string;
    const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();

    const [alunos, setAlunos] = useState<AlunoEstatisticas[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

    const canManage = user?.tipo === 'professor' || user?.tipo === 'desenvolvedor';

    const addToast = (toast: Omit<ToastNotification, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!authLoading && !canManage) {
            router.push('/dashboard');
            return;
        }

        if (authLoading || !isAuthenticated) return;

        const fetchAlunos = async () => {
            try {
                const data = await apiClient.get<AlunoEstatisticas[]>(`/turmas/${turmaId}/alunos`);
                setAlunos(data);
            } catch (error) {
                console.error('Erro ao carregar alunos:', error);
                addToast({
                    type: 'error',
                    message: 'Erro ao carregar alunos',
                    description: 'Tente novamente mais tarde'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAlunos();
    }, [router, turmaId, isAuthenticated, authLoading, canManage]);

    const handleRemoverAluno = async () => {
        if (!showDeleteModal) return;

        const alunoId = showDeleteModal;
        setRemovingId(alunoId);
        try {
            await apiClient.delete(`/turmas/${turmaId}/alunos/${alunoId}`);
            setAlunos(alunos.filter((a) => a.aluno_id !== alunoId));
            addToast({
                type: 'success',
                message: 'Aluno removido!',
                description: 'O aluno foi removido da turma com sucesso.'
            });
        } catch (error: any) {
            addToast({
                type: 'error',
                message: 'Erro ao remover aluno',
                description: error.message || 'Tente novamente mais tarde'
            });
        } finally {
            setRemovingId(null);
            setShowDeleteModal(null);
        }
    };

    const getInitials = (nome: string) => {
        const parts = nome.split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return nome.slice(0, 2).toUpperCase();
    };

    if (loading || authLoading) {
        return <Loading text="Carregando alunos..." />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-bg-primary text-slate-900 dark:text-text-primary transition-colors">
            <Header
                variant="dashboard"
                user={user}
                onLogout={signOut}
                extraActions={
                    <BackButton href={`/dashboard/turmas/${turmaId}`} />
                }
            />

            <main className="flex-grow flex items-center py-12 pt-24">
                <div className="container mx-auto px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 text-center"
                    >
                        <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-2xl mb-4">
                            <Users className="w-8 h-8 text-brand-600 dark:text-brand-500" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-text-primary tracking-tight mb-2">
                            Alunos da Turma
                        </h1>
                        <p className="text-slate-600 dark:text-text-secondary text-lg">
                            {alunos.length} aluno{alunos.length !== 1 ? 's' : ''} matriculado{alunos.length !== 1 ? 's' : ''}
                        </p>
                    </motion.div>

                    {alunos.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="bg-white dark:bg-bg-secondary rounded-2xl p-10 shadow-xl border border-slate-200 dark:border-border-custom text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Inbox className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                                    Turma vazia
                                </h3>
                                <p className="text-slate-600 dark:text-text-secondary mb-8 leading-relaxed">
                                    Compartilhe o código de acesso com seus alunos para que eles possam se matricular.
                                </p>
                                <Link
                                    href={`/dashboard/turmas/${turmaId}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl transition-all font-medium"
                                >
                                    Ver Código de Acesso <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            {/* Desktop Headers */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-8 mb-2 text-sm font-bold text-slate-400 dark:text-text-tertiary uppercase tracking-wider">
                                <div className="col-span-6 text-left">Aluno</div>
                                <div className="col-span-2 text-center">Progresso</div>
                                <div className="col-span-2 text-center">XP Total</div>
                                <div className="col-span-2 text-right">Ações</div>
                            </div>

                            {alunos.map((aluno, index) => (
                                <motion.div
                                    key={aluno.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-white dark:bg-bg-secondary rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-border-custom shadow-sm hover:shadow-md hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                                >
                                    {/* Aluno Info */}
                                    <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                                        <div className="relative">
                                            {aluno.usuario.avatar_url ? (
                                                <img
                                                    src={aluno.usuario.avatar_url}
                                                    alt={aluno.usuario.nome}
                                                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 dark:border-border-custom group-hover:border-brand-400 transition-colors"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white dark:border-bg-secondary shadow-sm group-hover:scale-105 transition-transform">
                                                    {getInitials(aluno.usuario.nome)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-text-primary group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                {aluno.usuario.nome}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-text-secondary flex items-center gap-1">
                                                <GraduationCap className="w-3.5 h-3.5" />
                                                Desde {new Date(aluno.matriculado_em).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progresso */}
                                    <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5 px-4 md:px-0">
                                        <div className="flex justify-between md:justify-center items-center">
                                            <span className="md:hidden text-sm font-medium text-slate-500">Progresso</span>
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                {aluno.estatisticas.percentual}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-bg-tertiary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${aluno.estatisticas.percentual}%` }}
                                                className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-400 text-center uppercase tracking-tighter">
                                            {aluno.estatisticas.licoes_completadas}/{aluno.estatisticas.total_licoes} lições
                                        </span>
                                    </div>

                                    {/* XP */}
                                    <div className="col-span-1 md:col-span-2 flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 dark:bg-yellow-400/5 text-yellow-700 dark:text-yellow-400 rounded-xl font-bold border border-yellow-400/20 shadow-sm">
                                            <Star className="w-4 h-4 fill-yellow-400" />
                                            {aluno.estatisticas.xp_total} XP
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                                        <button
                                            onClick={() => setShowDeleteModal(aluno.aluno_id)}
                                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
                                            title="Remover aluno"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Confirmação de Remoção */}
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
                            className="bg-white dark:bg-bg-secondary rounded-2xl border border-slate-200 dark:border-border-custom p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-2">
                                    Remover Aluno
                                </h3>
                                <p className="text-slate-500 dark:text-text-secondary mb-8 leading-relaxed">
                                    Tem certeza que deseja remover este aluno da turma? O progresso dele nesta turma será perdido.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(null)}
                                        disabled={!!removingId}
                                        className="flex-1 px-6 py-3.5 bg-slate-100 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-xl hover:bg-slate-200 dark:hover:bg-border-hover transition-colors disabled:opacity-50 font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleRemoverAluno}
                                        disabled={!!removingId}
                                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/20"
                                    >
                                        {removingId ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Removendo...
                                            </>
                                        ) : (
                                            <><Trash2 className="w-4 h-4" /> Remover</>
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
        </div>
    );
}
