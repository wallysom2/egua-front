'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, Loader, Users, Inbox } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    type: 'success' | 'error';
    message: string;
}

export default function AlunosTurmaPage() {
    const router = useRouter();
    const params = useParams();
    const turmaId = params.id as string;
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [alunos, setAlunos] = useState<AlunoEstatisticas[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [removingId, setRemovingId] = useState<string | null>(null);

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

        const fetchAlunos = async () => {
            try {
                const data = await apiClient.get<AlunoEstatisticas[]>(`/turmas/${turmaId}/alunos`);
                setAlunos(data);
            } catch (error) {
                console.error('Erro ao carregar alunos:', error);
                addToast('error', 'Erro ao carregar alunos');
            } finally {
                setLoading(false);
            }
        };

        fetchAlunos();
    }, [router, turmaId, isAuthenticated, authLoading, canManage]);

    const handleRemoverAluno = async (alunoId: string) => {
        if (!confirm('Tem certeza que deseja remover este aluno da turma?')) return;

        setRemovingId(alunoId);
        try {
            await apiClient.delete(`/turmas/${turmaId}/alunos/${alunoId}`);
            setAlunos(alunos.filter((a) => a.aluno_id !== alunoId));
            addToast('success', 'Aluno removido da turma');
        } catch (error: any) {
            addToast('error', error.message || 'Erro ao remover aluno');
        } finally {
            setRemovingId(null);
        }
    };

    // Função para obter iniciais do nome
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
                            <Users className="w-8 h-8 inline mr-2" /> Alunos da Turma
                        </h1>
                        <p className="text-slate-600 dark:text-text-secondary">
                            {alunos.length} aluno{alunos.length !== 1 ? 's' : ''} matriculado{alunos.length !== 1 ? 's' : ''}
                        </p>
                    </motion.div>

                    {/* Lista de Alunos */}
                    {alunos.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom shadow-sm">
                            <div className="text-6xl mb-6"><Inbox className="w-16 h-16 mx-auto text-slate-400" /></div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-4">
                                Nenhum aluno matriculado
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary max-w-md mx-auto">
                                Compartilhe o código de acesso da turma com seus alunos para que eles possam se matricular.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom shadow-lg overflow-hidden">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-100 dark:bg-bg-tertiary border-b border-slate-200 dark:border-border-custom text-sm font-medium text-slate-600 dark:text-text-secondary">
                                <div className="col-span-5">Aluno</div>
                                <div className="col-span-2 text-center">Progresso</div>
                                <div className="col-span-2 text-center">XP</div>
                                <div className="col-span-2 text-center">Lições</div>
                                <div className="col-span-1"></div>
                            </div>

                            {/* Alunos */}
                            {alunos.map((aluno, index) => (
                                <motion.div
                                    key={aluno.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-100 dark:border-border-custom last:border-0 hover:bg-slate-50 dark:hover:bg-bg-tertiary transition-colors"
                                >
                                    {/* Info do Aluno */}
                                    <div className="col-span-5 flex items-center gap-3">
                                        {aluno.usuario.avatar_url ? (
                                            <img
                                                src={aluno.usuario.avatar_url}
                                                alt={aluno.usuario.nome}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {getInitials(aluno.usuario.nome)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-text-primary">
                                                {aluno.usuario.nome}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-text-secondary">
                                                {aluno.usuario.email || `Desde ${new Date(aluno.matriculado_em).toLocaleDateString('pt-BR')}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progresso */}
                                    <div className="col-span-2 text-center">
                                        <div className="inline-flex items-center gap-2">
                                            <div className="w-20 h-2 bg-slate-200 dark:bg-bg-tertiary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                                    style={{ width: `${aluno.estatisticas.percentual}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                {aluno.estatisticas.percentual}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* XP */}
                                    <div className="col-span-2 text-center">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                                            <Star className="w-4 h-4" /> {aluno.estatisticas.xp_total}
                                        </span>
                                    </div>

                                    {/* Lições */}
                                    <div className="col-span-2 text-center text-sm text-slate-600 dark:text-text-secondary">
                                        <span className="font-medium text-slate-900 dark:text-text-primary">
                                            {aluno.estatisticas.licoes_completadas}
                                        </span>
                                        /{aluno.estatisticas.total_licoes}
                                    </div>

                                    {/* Ações */}
                                    <div className="col-span-1 text-right">
                                        <button
                                            onClick={() => handleRemoverAluno(aluno.aluno_id)}
                                            disabled={removingId === aluno.aluno_id}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                            title="Remover aluno"
                                        >
                                            {removingId === aluno.aluno_id ? <Loader className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
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
