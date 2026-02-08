'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowLeft, Loader, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface Questao {
    id: number;
    enunciado: string;
    tipo: string;
    nivel: string;
    ordem?: number;
}

interface Exercicio {
    id: number;
    titulo: string;
    linguagem_id: number;
}

interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

export default function GerenciarQuestoesPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const exercicioId = params.id as string;
    const turmaId = searchParams.get('turmaId');

    const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();

    const [exercicio, setExercicio] = useState<Exercicio | null>(null);
    const [questoesDoExercicio, setQuestoesDoExercicio] = useState<Questao[]>([]);
    const [todasQuestoes, setTodasQuestoes] = useState<Questao[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    const canManage = user?.tipo === 'professor' || user?.tipo === 'desenvolvedor';

    const addToast = (toast: Omit<ToastNotification, 'id'>) => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { ...toast, id }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (authLoading || !isAuthenticated) return;

        const fetchData = async () => {
            try {
                const [exercicioData, questoesExercicioData, todasQuestoesData] = await Promise.all([
                    apiClient.get<Exercicio>(`/exercicios/${exercicioId}`),
                    apiClient.get<Questao[]>(`/exercicios/${exercicioId}/questoes`),
                    apiClient.get<Questao[]>('/questoes'),
                ]);

                setExercicio(exercicioData);
                setQuestoesDoExercicio(questoesExercicioData);
                setTodasQuestoes(todasQuestoesData);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                addToast({ type: 'error', message: 'Erro ao carregar dados' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [exercicioId, router, isAuthenticated, authLoading]);

    const handleAdicionarQuestao = async (questaoId: number) => {
        setSaving(true);
        try {
            await apiClient.post(`/exercicios/${exercicioId}/questoes`, { questao_id: questaoId });
            const questaoAdicionada = todasQuestoes.find(q => q.id === questaoId);
            if (questaoAdicionada) {
                setQuestoesDoExercicio(prev => [...prev, questaoAdicionada]);
            }
            addToast({ type: 'success', message: 'Questão adicionada com sucesso!' });
        } catch (error: any) {
            addToast({ type: 'error', message: error.message || 'Erro ao adicionar questão' });
        } finally {
            setSaving(false);
        }
    };

    const handleRemoverQuestao = async (questaoId: number) => {
        setSaving(true);
        try {
            await apiClient.delete(`/exercicios/${exercicioId}/questoes/${questaoId}`);
            setQuestoesDoExercicio(prev => prev.filter(q => q.id !== questaoId));
            addToast({ type: 'success', message: 'Questão removida com sucesso!' });
        } catch (error: any) {
            addToast({ type: 'error', message: error.message || 'Erro ao remover questão' });
        } finally {
            setSaving(false);
        }
    };

    const questoesVinculadasIds = new Set(questoesDoExercicio.map(q => q.id));
    const questoesDisponiveis = todasQuestoes.filter(q =>
        !questoesVinculadasIds.has(q.id) &&
        q.enunciado.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <Loading text="Carregando..." />;
    }

    if (!canManage) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-4xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Acesso Negado</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Apenas professores podem gerenciar questões.
                </p>
                <Link href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Voltar ao Painel
                </Link>
            </div>
        );
    }

    const backUrl = turmaId ? `/dashboard/turmas/${turmaId}/trilha` : '/dashboard';

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-bg-primary dark:via-bg-secondary dark:to-bg-primary transition-colors">
            <Header variant="dashboard" user={user} onLogout={signOut} extraActions={<BackButton href={backUrl} />} />

            {/* Toast notifications */}
            <div className="fixed top-24 right-4 z-50 space-y-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 text-white' :
                                    toast.type === 'error' ? 'bg-red-500 text-white' :
                                        'bg-blue-500 text-white'
                                }`}
                        >
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {toast.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                            {toast.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <main className="flex-1 py-8 pt-28">
                <div className="container mx-auto px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Gerenciar Questões
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Exercício: <span className="font-semibold">{exercicio?.titulo}</span>
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Questões do Exercício */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-bg-secondary rounded-2xl border border-slate-200 dark:border-border-custom p-6"
                        >
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                Questões Vinculadas ({questoesDoExercicio.length})
                            </h2>

                            {questoesDoExercicio.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <div className="text-4xl mb-3">📝</div>
                                    <p>Nenhuma questão vinculada</p>
                                    <p className="text-sm mt-1">Adicione questões da lista ao lado</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {questoesDoExercicio.map((questao, index) => (
                                        <div
                                            key={questao.id}
                                            className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-bg-tertiary rounded-xl border border-slate-100 dark:border-border-custom"
                                        >
                                            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-2">
                                                    {questao.enunciado}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                                        {questao.tipo}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                                                        {questao.nivel}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoverQuestao(questao.id)}
                                                disabled={saving}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                                                title="Remover questão"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Questões Disponíveis */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-bg-secondary rounded-2xl border border-slate-200 dark:border-border-custom p-6"
                        >
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-brand-500" />
                                Questões Disponíveis
                            </h2>

                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar questões..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                />
                            </div>

                            {questoesDisponiveis.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <div className="text-4xl mb-3">🔍</div>
                                    <p>Nenhuma questão disponível</p>
                                    <Link
                                        href="/dashboard/licoes/criar/questao"
                                        className="inline-flex items-center gap-2 mt-4 text-brand-600 hover:text-brand-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Criar nova questão
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[430px] overflow-y-auto">
                                    {questoesDisponiveis.map((questao) => (
                                        <div
                                            key={questao.id}
                                            className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-bg-tertiary rounded-xl border border-slate-100 dark:border-border-custom hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-2">
                                                    {questao.enunciado}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                                        {questao.tipo}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                                                        {questao.nivel}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAdicionarQuestao(questao.id)}
                                                disabled={saving}
                                                className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all disabled:opacity-50"
                                                title="Adicionar questão"
                                            >
                                                {saving ? (
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Plus className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
