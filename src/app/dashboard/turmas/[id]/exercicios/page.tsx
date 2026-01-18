'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, ClipboardList, Eye, Trash2, ChevronRight, BookOpen, AlertCircle, Loader } from 'lucide-react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface Exercicio {
    id: number;
    titulo: string;
    linguagem?: {
        id: number;
        nome: string;
    };
}

interface TurmaExercicio {
    id: string;
    turma_id: string;
    exercicio_id: number;
    ordem: number;
    obrigatorio: boolean;
    exercicio: Exercicio;
}

interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    description?: string;
}

export default function ExerciciosTurmaPage() {
    const router = useRouter();
    const params = useParams();
    const turmaId = params.id as string;
    const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();

    const [exerciciosTurma, setExerciciosTurma] = useState<TurmaExercicio[]>([]);
    const [todosExercicios, setTodosExercicios] = useState<Exercicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [addForm, setAddForm] = useState({ exercicio_id: 0, ordem: 1, obrigatorio: true });
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

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

        const fetchData = async () => {
            try {
                const [turmaEx, todosEx] = await Promise.all([
                    apiClient.get<TurmaExercicio[]>(`/turmas/${turmaId}/exercicios`),
                    apiClient.get<Exercicio[]>('/exercicios'),
                ]);
                setExerciciosTurma(turmaEx);
                setTodosExercicios(todosEx);
            } catch (error) {
                console.error('Erro ao carregar exercícios:', error);
                addToast({
                    type: 'error',
                    message: 'Erro ao carregar exercícios',
                    description: 'Tente novamente mais tarde'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router, turmaId, isAuthenticated, authLoading, canManage]);

    const exerciciosDisponiveis = todosExercicios.filter(
        (ex) => !exerciciosTurma.some((te) => te.exercicio_id === ex.id)
    );

    const handleAddExercicio = async () => {
        if (!addForm.exercicio_id) {
            addToast({ type: 'error', message: 'Selecione um exercício' });
            return;
        }

        setSaving(true);
        try {
            const novo = await apiClient.post<TurmaExercicio>(`/turmas/${turmaId}/exercicios`, {
                exercicio_id: addForm.exercicio_id,
                ordem: addForm.ordem,
                obrigatorio: addForm.obrigatorio,
            });

            const exercicioCompleto = todosExercicios.find((e) => e.id === addForm.exercicio_id);
            setExerciciosTurma([
                ...exerciciosTurma,
                { ...novo, exercicio: exercicioCompleto as Exercicio },
            ]);
            setShowModal(false);
            setAddForm({ exercicio_id: 0, ordem: exerciciosTurma.length + 2, obrigatorio: true });
            addToast({
                type: 'success',
                message: 'Exercício adicionado!',
                description: 'O exercício agora está disponível para a turma.'
            });
        } catch (error: any) {
            addToast({
                type: 'error',
                message: 'Erro ao adicionar exercício',
                description: error.message || 'Tente novamente'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveExercicio = async () => {
        if (showDeleteModal === null) return;

        const exercicioId = showDeleteModal;
        setSaving(true);
        try {
            await apiClient.delete(`/turmas/${turmaId}/exercicios/${exercicioId}`);
            setExerciciosTurma(exerciciosTurma.filter((te) => te.exercicio_id !== exercicioId));
            addToast({
                type: 'success',
                message: 'Exercício removido!',
                description: 'O exercício foi removido da turma.'
            });
        } catch (error: any) {
            addToast({
                type: 'error',
                message: 'Erro ao remover exercício',
                description: error.message || 'Tente novamente'
            });
        } finally {
            setSaving(false);
            setShowDeleteModal(null);
        }
    };

    const openAddModal = () => {
        setAddForm({
            exercicio_id: 0,
            ordem: exerciciosTurma.length + 1,
            obrigatorio: true,
        });
        setShowModal(true);
    };

    if (loading || authLoading) {
        return <Loading text="Carregando exercícios..." />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-bg-primary text-slate-900 dark:text-text-primary transition-colors">
            <Header
                variant="dashboard"
                user={user}
                onLogout={signOut}
                extraActions={
                    <>
                        <BackButton href={`/dashboard/turmas/${turmaId}`} />
                        <button
                            onClick={openAddModal}
                            disabled={exerciciosDisponiveis.length === 0}
                            className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Adicionar</span>
                        </button>
                    </>
                }
            />

            <main className="flex-grow flex items-center py-8 sm:py-12 pt-20 sm:pt-24">
                <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 text-center"
                    >
                        <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-4">
                            <ClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-text-primary tracking-tight mb-2">
                            Exercícios da Turma
                        </h1>
                        <p className="text-slate-600 dark:text-text-secondary text-lg">
                            {exerciciosTurma.length} exercício{exerciciosTurma.length !== 1 ? 's' : ''} associado{exerciciosTurma.length !== 1 ? 's' : ''}
                        </p>
                    </motion.div>

                    {exerciciosTurma.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="bg-white dark:bg-bg-secondary rounded-2xl p-10 shadow-xl border border-slate-200 dark:border-border-custom text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ClipboardList className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                                    Nenhum exercício
                                </h3>
                                <p className="text-slate-600 dark:text-text-secondary mb-8 leading-relaxed">
                                    Adicione exercícios para que seus alunos possam praticar o que aprenderam.
                                </p>
                                {exerciciosDisponiveis.length > 0 ? (
                                    <button
                                        onClick={openAddModal}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-brand-500/20"
                                    >
                                        <Plus className="w-5 h-5" /> Adicionar Primeiro Exercício
                                    </button>
                                ) : (
                                    <Link
                                        href="/dashboard/licoes"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-xl hover:bg-slate-200 dark:hover:bg-border-hover transition-all font-medium"
                                    >
                                        Ir para Banco de Questões <ChevronRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            {exerciciosTurma
                                .sort((a, b) => a.ordem - b.ordem)
                                .map((te, index) => (
                                    <motion.div
                                        key={te.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group bg-white dark:bg-bg-secondary rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-border-custom shadow-sm hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all flex flex-col md:flex-row items-center gap-4"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                                            {te.ordem}
                                        </div>

                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {te.exercicio.titulo}
                                            </h3>
                                            <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-sm">
                                                {te.exercicio.linguagem && (
                                                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-medium flex items-center gap-1.5 border border-blue-200/50 dark:border-blue-700/50">
                                                        <BookOpen className="w-3.5 h-3.5" />
                                                        {te.exercicio.linguagem.nome}
                                                    </span>
                                                )}
                                                {te.obrigatorio ? (
                                                    <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium flex items-center gap-1.5 border border-red-200/50 dark:border-red-700/50">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Obrigatório
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-bg-tertiary text-slate-600 dark:text-text-tertiary rounded-lg font-medium">
                                                        Opcional
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/dashboard/licoes/${te.exercicio_id}`}
                                                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                                                title="Visualizar exercício"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => setShowDeleteModal(te.exercicio_id)}
                                                className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
                                                title="Remover exercício"
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

            {/* Modal de Adicionar Exercício */}
            <AnimatePresence>
                {showModal && (
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
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-6 flex items-center gap-2">
                                <Plus className="w-6 h-6 text-brand-600" /> Adicionar Exercício
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2">
                                        Selecione o Exercício
                                    </label>
                                    <select
                                        value={addForm.exercicio_id}
                                        onChange={(e) => setAddForm({ ...addForm, exercicio_id: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value={0}>Selecione...</option>
                                        {exerciciosDisponiveis.map((ex) => (
                                            <option key={ex.id} value={ex.id}>
                                                {ex.titulo}
                                                {ex.linguagem && ` (${ex.linguagem.nome})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2">
                                            Ordem
                                        </label>
                                        <input
                                            type="number"
                                            value={addForm.ordem}
                                            onChange={(e) => setAddForm({ ...addForm, ordem: parseInt(e.target.value) || 1 })}
                                            min={1}
                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2">
                                            Tipo
                                        </label>
                                        <select
                                            value={addForm.obrigatorio ? 'true' : 'false'}
                                            onChange={(e) => setAddForm({ ...addForm, obrigatorio: e.target.value === 'true' })}
                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="true">Obrigatório</option>
                                            <option value="false">Opcional</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-xl hover:bg-slate-200 dark:hover:bg-border-hover transition-all font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddExercicio}
                                    disabled={saving}
                                    className="flex-1 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all font-medium shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <><Loader className="w-5 h-5 animate-spin" /> Salvando...</> : 'Adicionar'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Confirmação de Remoção */}
            <AnimatePresence>
                {showDeleteModal !== null && (
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
                                    Remover Exercício
                                </h3>
                                <p className="text-slate-500 dark:text-text-secondary mb-8 leading-relaxed">
                                    Tem certeza que deseja remover este exercício da turma? Os alunos não poderão mais resolvê-lo através desta turma.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(null)}
                                        disabled={saving}
                                        className="flex-1 px-6 py-3.5 bg-slate-100 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-xl hover:bg-slate-200 dark:hover:bg-border-hover transition-colors disabled:opacity-50 font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleRemoveExercicio}
                                        disabled={saving}
                                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/20"
                                    >
                                        {saving ? (
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
