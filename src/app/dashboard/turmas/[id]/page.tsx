'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, ArrowLeft, Check, Copy, Pencil, Users, FileText, Target, QrCode, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
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
    const [showQrModal, setShowQrModal] = useState(false);

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
                        className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" /> Voltar para Turmas
                    </Link>
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
                    <BackButton href="/dashboard/turmas" />
                }
            />

            {/* Conteúdo Principal */}
            <main className="flex-grow flex items-center py-20 pt-32 relative">
                {/* Código de Acesso e QR - Posicionado no Canto Superior Direito no Desktop */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:absolute lg:top-36 lg:right-10 mb-8 lg:mb-0 text-center lg:text-right z-10 w-full lg:w-auto px-6 lg:px-0"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-bg-secondary border border-slate-200 dark:border-border-custom rounded-xl shadow-sm">
                        <div className="flex flex-col items-start pr-3 border-r border-slate-200 dark:border-border-custom">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-tertiary tracking-widest">Código</span>
                            <span className="font-mono font-bold text-lg text-brand-600 dark:text-brand-500 tracking-wider">
                                {turma.codigo_acesso}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={copyToClipboard}
                                className={`p-2 rounded-lg transition-all ${copiedCode
                                    ? 'bg-green-500 text-white shadow-green-500/20'
                                    : 'bg-slate-50 dark:bg-bg-tertiary hover:bg-slate-100 dark:hover:bg-border-hover text-slate-600 dark:text-text-secondary border border-slate-200 dark:border-border-custom'
                                    }`}
                                title="Copiar código"
                            >
                                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setShowQrModal(true)}
                                className="p-2 bg-slate-50 dark:bg-bg-tertiary hover:bg-slate-100 dark:hover:bg-border-hover text-slate-600 dark:text-text-secondary rounded-lg transition-all border border-slate-200 dark:border-border-custom"
                                title="Gerar QR Code de Matrícula"
                            >
                                <QrCode className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div className="container mx-auto px-6 relative">
                    {/* Header da Turma - Simplificado */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16 text-center"
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
                            <div className="flex items-center justify-center gap-3">
                                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-text-primary tracking-tight">
                                    {turma.nome}
                                </h1>
                                {canManage && (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="p-2 text-slate-300 hover:text-brand-600 transition-colors"
                                        title="Editar nome"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Modal do QR Code */}
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
                                                onClick={() => setShowQrModal(false)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-bg-tertiary rounded-full transition-colors"
                                            >
                                                <X className="w-5 h-5 text-slate-500" />
                                            </button>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-inner">
                                            {/* Gerando QR Code via API externa para evitar dependências extras */}
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                                    typeof window !== 'undefined'
                                                        ? `${window.location.origin}/dashboard/entrar-turma?codigo=${turma.codigo_acesso}`
                                                        : ''
                                                )}`}
                                                alt="QR Code de Matrícula"
                                                className="w-48 h-48 mx-auto"
                                            />
                                        </div>

                                        <p className="text-slate-600 dark:text-text-secondary mb-2 font-medium">
                                            Turma: <span className="text-brand-600">{turma.nome}</span>
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-text-secondary mb-6 leading-relaxed">
                                            Peça para seus alunos escanearem este QR Code para serem matriculados automaticamente.
                                        </p>

                                        <div className="flex flex-col gap-2">
                                            <div className="py-3 bg-slate-100 dark:bg-bg-tertiary rounded-lg font-mono font-bold text-lg text-slate-900 dark:text-text-primary tracking-widest uppercase">
                                                {turma.codigo_acesso}
                                            </div>
                                            <button
                                                onClick={() => setShowQrModal(false)}
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

                    {/* Cards de Ação */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <DashboardCard
                            title="Alunos"
                            icon={Users}
                            color="brand"
                            href={`/dashboard/turmas/${turma.id}/alunos`}
                            delay={0.1}
                        />

                        <DashboardCard
                            title="Exercícios"
                            icon={FileText}
                            color="brand"
                            href={`/dashboard/turmas/${turma.id}/exercicios`}
                            delay={0.2}
                        />

                        <DashboardCard
                            title="Trilha"
                            icon={Target}
                            color="brand"
                            href={`/dashboard/turmas/${turma.id}/trilha`}
                            delay={0.3}
                        />
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
        </>
    );
}
