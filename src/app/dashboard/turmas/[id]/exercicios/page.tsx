'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, ClipboardList, Eye, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    type: 'success' | 'error';
    message: string;
}

export default function ExerciciosTurmaPage() {
    const router = useRouter();
    const params = useParams();
    const turmaId = params.id as string;
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [exerciciosTurma, setExerciciosTurma] = useState<TurmaExercicio[]>([]);
    const [todosExercicios, setTodosExercicios] = useState<Exercicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [addForm, setAddForm] = useState({ exercicio_id: 0, ordem: 1, obrigatorio: true });
    const [saving, setSaving] = useState(false);

    const canManage = user?.tipo === 'professor' || user?.tipo === 'desenvolvedor';

    const addToast = (type: 'success' | 'error', message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
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
                addToast('error', 'Erro ao carregar exercícios');
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
            addToast('error', 'Selecione um exercício');
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
            addToast('success', 'Exercício adicionado!');
        } catch (error: any) {
            addToast('error', error.message || 'Erro ao adicionar exercício');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveExercicio = async (exercicioId: number) => {
        if (!confirm('Tem certeza que deseja remover este exercício da turma?')) return;

        try {
            await apiClient.delete(`/turmas/${turmaId}/exercicios/${exercicioId}`);
            setExerciciosTurma(exerciciosTurma.filter((te) => te.exercicio_id !== exercicioId));
            addToast('success', 'Exercício removido!');
        } catch (error: any) {
            addToast('error', error.message || 'Erro ao remover exercício');
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
                                <Image src="/hu.png" alt="Logo" width={32} height={32} className="w-8 h-8" />
                                <span>Senior Code AI</span>
                            </Link>
                        </motion.div>
                        <div className="flex items-center gap-3">
                            <BackButton href={`/dashboard/turmas/${turmaId}`} />
                            <ThemeToggle />
                            <button
                                onClick={openAddModal}
                                disabled={exerciciosDisponiveis.length === 0}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                            >
                                <Plus className="w-5 h-5" /> Adicionar Exercício
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Conteúdo Principal */}
            <main className="flex-1 py-16 pt-32">
                <div className="container mx-auto px-6 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-2">
                            <FileText className="w-8 h-8 inline mr-2" /> Exercícios da Turma
                        </h1>
                        <p className="text-slate-600 dark:text-text-secondary">
                            {exerciciosTurma.length} exercício{exerciciosTurma.length !== 1 ? 's' : ''} associado{exerciciosTurma.length !== 1 ? 's' : ''}
                        </p>
                    </motion.div>

                    {/* Lista de Exercícios */}
                    {exerciciosTurma.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom shadow-sm">
                            <div className="text-6xl mb-6"><ClipboardList className="w-16 h-16 mx-auto text-slate-400" /></div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-4">
                                Nenhum exercício adicionado
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary mb-8 max-w-md mx-auto">
                                Adicione exercícios para os alunos desta turma praticarem
                            </p>
                            {exerciciosDisponiveis.length > 0 ? (
                                <button
                                    onClick={openAddModal}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-5 h-5" /> Adicionar Primeiro Exercício
                                </button>
                            ) : todosExercicios.length === 0 ? (
                                <div className="space-y-4">
                                    <p className="text-amber-600 dark:text-amber-400 font-medium">
                                        Nenhum exercício cadastrado no sistema ainda.
                                    </p>
                                    <Link
                                        href="/dashboard/licoes/criar/exercicio"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" /> Criar Novo Exercício
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    Todos os exercícios disponíveis já foram adicionados a esta turma.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {exerciciosTurma
                                .sort((a, b) => a.ordem - b.ordem)
                                .map((te, index) => (
                                    <motion.div
                                        key={te.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center gap-4 p-5 bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                            {te.ordem}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 dark:text-text-primary">
                                                {te.exercicio.titulo}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm">
                                                {te.exercicio.linguagem && (
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                                        {te.exercicio.linguagem.nome}
                                                    </span>
                                                )}
                                                {te.obrigatorio ? (
                                                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                                                        Obrigatório
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                                                        Opcional
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/dashboard/licoes/${te.exercicio_id}`}
                                            className="px-4 py-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4" /> Ver
                                        </Link>
                                        <button
                                            onClick={() => handleRemoveExercicio(te.exercicio_id)}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Remover exercício"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
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
                            className="bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom p-6 max-w-md w-full shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-6">
                                <Plus className="w-5 h-5 inline mr-1" /> Adicionar Exercício
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                        Exercício *
                                    </label>
                                    <select
                                        value={addForm.exercicio_id}
                                        onChange={(e) => setAddForm({ ...addForm, exercicio_id: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary"
                                    >
                                        <option value={0}>Selecione um exercício...</option>
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
                                        <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                            Ordem
                                        </label>
                                        <input
                                            type="number"
                                            value={addForm.ordem}
                                            onChange={(e) => setAddForm({ ...addForm, ordem: parseInt(e.target.value) || 1 })}
                                            min={1}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                            Tipo
                                        </label>
                                        <select
                                            value={addForm.obrigatorio ? 'true' : 'false'}
                                            onChange={(e) => setAddForm({ ...addForm, obrigatorio: e.target.value === 'true' })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary"
                                        >
                                            <option value="true">Obrigatório</option>
                                            <option value="false">Opcional</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-slate-200 dark:bg-bg-tertiary text-slate-900 dark:text-text-primary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddExercicio}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Adicionando...' : 'Adicionar'}
                                </button>
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
                                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
                                : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
                                }`}
                        >
                            {toast.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
