'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, BookOpen, BarChart2, Star, FileText, Pencil, Trash2, X, ChevronRight, Layout, AlertTriangle, Loader, ChevronDown } from 'lucide-react';
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

interface Licao {
    id: string;
    exercicio: {
        id: number;
        titulo: string;
    };
    ordem: number;
    xp_recompensa: number;
}

interface Modulo {
    id: string;
    titulo: string;
    descricao: string | null;
    icone: string | null;
    ordem: number;
    xp_recompensa: number;
    trilha_licao: Licao[];
}

interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    description?: string;
}

export default function TrilhaConfigPage() {
    const router = useRouter();
    const params = useParams();
    const turmaId = params.id as string;
    const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();

    const [modulos, setModulos] = useState<Modulo[]>([]);
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    const [showModuloModal, setShowModuloModal] = useState(false);
    const [showLicaoModal, setShowLicaoModal] = useState<string | null>(null);
    const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<{ type: 'modulo' | 'licao', id: string, parentId?: string } | null>(null);

    const [moduloForm, setModuloForm] = useState({
        titulo: '',
        descricao: '',
        icone: '',
        ordem: 1,
        xp_recompensa: 50,
    });
    const [licaoForm, setLicaoForm] = useState({
        exercicio_id: 0,
        ordem: 1,
        xp_recompensa: 10,
    });
    const [saving, setSaving] = useState(false);

    const canManage = user?.tipo === 'professor' || user?.tipo === 'desenvolvedor';

    const addToast = (toast: Omit<ToastNotification, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
    };

    const fetchTrilha = async () => {
        try {
            const data = await apiClient.get<Modulo[]>(`/turmas/${turmaId}/trilha`);
            setModulos(data);
        } catch (error) {
            console.error('Erro ao carregar trilha:', error);
            addToast({ type: 'error', message: 'Erro ao carregar trilha' });
        }
    };

    const fetchExercicios = async () => {
        try {
            const data = await apiClient.get<Exercicio[]>('/exercicios');
            setExercicios(data);
        } catch (error) {
            console.error('Erro ao carregar exercícios:', error);
        }
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

        const loadData = async () => {
            await Promise.all([fetchTrilha(), fetchExercicios()]);
            setLoading(false);
        };

        loadData();
    }, [router, turmaId, isAuthenticated, authLoading, canManage]);

    const handleCreateModulo = async () => {
        if (!moduloForm.titulo.trim()) {
            addToast({ type: 'error', message: 'Título é obrigatório' });
            return;
        }

        setSaving(true);
        try {
            const novoModulo = await apiClient.post<Modulo>(`/turmas/${turmaId}/trilha/modulos`, {
                titulo: moduloForm.titulo,
                descricao: moduloForm.descricao || undefined,
                icone: moduloForm.icone || undefined,
                ordem: moduloForm.ordem,
                xp_recompensa: moduloForm.xp_recompensa,
            });

            setModulos([...modulos, { ...novoModulo, trilha_licao: [] }]);
            setShowModuloModal(false);
            setModuloForm({ titulo: '', descricao: '', icone: '', ordem: modulos.length + 1, xp_recompensa: 50 });
            addToast({ type: 'success', message: 'Módulo criado com sucesso!' });
        } catch (error: any) {
            addToast({ type: 'error', message: error.message || 'Erro ao criar módulo' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateModulo = async () => {
        if (!editingModulo || !moduloForm.titulo.trim()) return;

        setSaving(true);
        try {
            await apiClient.put(`/turmas/${turmaId}/trilha/modulos/${editingModulo.id}`, {
                titulo: moduloForm.titulo,
                descricao: moduloForm.descricao || undefined,
                icone: moduloForm.icone || undefined,
                ordem: moduloForm.ordem,
                xp_recompensa: moduloForm.xp_recompensa,
            });

            setModulos(modulos.map((m) =>
                m.id === editingModulo.id
                    ? { ...m, ...moduloForm }
                    : m
            ));
            setShowModuloModal(false);
            setEditingModulo(null);
            setModuloForm({ titulo: '', descricao: '', icone: '', ordem: modulos.length + 1, xp_recompensa: 50 });
            addToast({ type: 'success', message: 'Módulo atualizado!' });
        } catch (error: any) {
            addToast({ type: 'error', message: error.message || 'Erro ao atualizar módulo' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteModal) return;

        setSaving(true);
        try {
            if (showDeleteModal.type === 'modulo') {
                await apiClient.delete(`/turmas/${turmaId}/trilha/modulos/${showDeleteModal.id}`);
                setModulos(modulos.filter((m) => m.id !== showDeleteModal.id));
                addToast({ type: 'success', message: 'Módulo removido!' });
            } else {
                await apiClient.delete(`/turmas/${turmaId}/trilha/licoes/${showDeleteModal.id}`);
                setModulos(modulos.map((m) =>
                    m.id === showDeleteModal.parentId
                        ? { ...m, trilha_licao: m.trilha_licao.filter((l) => l.id !== showDeleteModal.id) }
                        : m
                ));
                addToast({ type: 'success', message: 'Lição removida!' });
            }
        } catch (error: any) {
            addToast({ type: 'error', message: error.message || 'Erro ao remover' });
        } finally {
            setSaving(false);
            setShowDeleteModal(null);
        }
    };

    const handleCreateLicao = async (moduloId: string) => {
        if (!licaoForm.exercicio_id) {
            addToast({ type: 'error', message: 'Selecione um exercício' });
            return;
        }

        setSaving(true);
        try {
            const novaLicao = await apiClient.post<Licao>(`/turmas/${turmaId}/trilha/modulos/${moduloId}/licoes`, {
                exercicio_id: licaoForm.exercicio_id,
                ordem: licaoForm.ordem,
                xp_recompensa: licaoForm.xp_recompensa,
            });

            setModulos(modulos.map((m) =>
                m.id === moduloId
                    ? { ...m, trilha_licao: [...m.trilha_licao, novaLicao] }
                    : m
            ));
            setShowLicaoModal(null);
            setLicaoForm({ exercicio_id: 0, ordem: 1, xp_recompensa: 10 });
            addToast({ type: 'success', message: 'Lição adicionada!' });
        } catch (error: any) {
            addToast({ type: 'error', message: error.message || 'Erro ao adicionar lição' });
        } finally {
            setSaving(false);
        }
    };

    const openEditModulo = (modulo: Modulo) => {
        setEditingModulo(modulo);
        setModuloForm({
            titulo: modulo.titulo,
            descricao: modulo.descricao || '',
            icone: modulo.icone || '',
            ordem: modulo.ordem,
            xp_recompensa: modulo.xp_recompensa,
        });
        setShowModuloModal(true);
    };

    const openNewModulo = () => {
        setEditingModulo(null);
        setModuloForm({
            titulo: '',
            descricao: '',
            icone: '',
            ordem: modulos.length + 1,
            xp_recompensa: 50,
        });
        setShowModuloModal(true);
    };

    const openNewLicao = (moduloId: string) => {
        const modulo = modulos.find((m) => m.id === moduloId);
        setLicaoForm({
            exercicio_id: 0,
            ordem: (modulo?.trilha_licao.length || 0) + 1,
            xp_recompensa: 10,
        });
        setShowLicaoModal(moduloId);
    };

    if (loading || authLoading) {
        return <Loading text="Carregando trilha..." />;
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
                            onClick={openNewModulo}
                            className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-brand-500/20"
                        >
                            <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Novo Módulo</span>
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
                        <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-2xl mb-4">
                            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-500" />
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-text-primary tracking-tight mb-2">
                            Trilha de Aprendizado
                        </h1>
                    </motion.div>

                    {modulos.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="bg-white dark:bg-bg-secondary rounded-2xl p-10 shadow-xl border border-slate-200 dark:border-border-custom text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Layout className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-text-primary">
                                    Sem trilha ainda
                                </h3>
                                <p className="text-slate-600 dark:text-text-secondary mb-8 leading-relaxed">
                                    Crie seu primeiro módulo para começar a organizar as lições dos alunos.
                                </p>
                                <button
                                    onClick={openNewModulo}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-brand-500/20"
                                >
                                    <Plus className="w-5 h-5" /> Criar Primeiro Módulo
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-8 max-w-4xl mx-auto">
                            {modulos.sort((a, b) => a.ordem - b.ordem).map((modulo, index) => (
                                <motion.div
                                    key={modulo.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white dark:bg-bg-secondary rounded-2xl border border-slate-200 dark:border-border-custom shadow-sm hover:shadow-md transition-all overflow-hidden"
                                >
                                    <div className="p-6 bg-slate-50 dark:bg-bg-tertiary border-b border-slate-200 dark:border-border-custom">
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                                                {modulo.icone || index + 1}
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-text-primary group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                        {modulo.titulo}
                                                    </h3>
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold rounded-full uppercase tracking-widest w-fit mx-auto md:mx-0">
                                                        Módulo {modulo.ordem}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-slate-500 dark:text-text-secondary">
                                                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500" /> {modulo.xp_recompensa} XP</span>
                                                    <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-brand-500" /> {modulo.trilha_licao.length} lições</span>
                                                </div>
                                                {modulo.descricao && (
                                                    <p className="text-sm text-slate-500 dark:text-text-tertiary mt-2 line-clamp-2">
                                                        {modulo.descricao}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModulo(modulo)}
                                                    className="p-3 text-slate-400 hover:text-brand-600 hover:bg-white dark:hover:bg-bg-tertiary rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-border-custom shadow-sm"
                                                    title="Editar módulo"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteModal({ type: 'modulo', id: modulo.id })}
                                                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
                                                    title="Remover módulo"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-3">
                                        <AnimatePresence>
                                            {modulo.trilha_licao.sort((a, b) => a.ordem - b.ordem).map((licao) => (
                                                <motion.div
                                                    key={licao.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center justify-between p-4 bg-white dark:bg-bg-secondary border border-slate-100 dark:border-border-custom rounded-xl hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all group/licao"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm border border-emerald-500/20">
                                                            {licao.ordem}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 dark:text-text-secondary group-hover/licao:text-brand-600 transition-colors">
                                                                {licao.exercicio.titulo}
                                                            </p>
                                                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                                                <Star className="w-3 h-3 fill-amber-500" /> +{licao.xp_recompensa} XP
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowDeleteModal({ type: 'licao', id: licao.id, parentId: modulo.id })}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                        title="Remover lições"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <button
                                            onClick={() => openNewLicao(modulo.id)}
                                            className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-border-custom text-slate-400 dark:text-text-tertiary hover:border-brand-400/50 hover:text-brand-600 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 rounded-2xl transition-all flex items-center justify-center gap-2 font-medium group/add"
                                        >
                                            <div className="p-1 bg-slate-100 dark:bg-bg-tertiary rounded-full group-hover/add:bg-brand-100 dark:group-hover/add:bg-brand-900/30 transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            Adicionar Lição ao Módulo
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Módulo */}
            <AnimatePresence>
                {showModuloModal && (
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
                                {editingModulo ? <><Pencil className="w-6 h-6 text-brand-600" /> Editar Módulo</> : <><Plus className="w-6 h-6 text-brand-600" /> Novo Módulo</>}
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2">
                                        Título do Módulo *
                                    </label>
                                    <input
                                        type="text"
                                        value={moduloForm.titulo}
                                        onChange={(e) => setModuloForm({ ...moduloForm, titulo: e.target.value })}
                                        placeholder="Ex: Primeiros Passos"
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={moduloForm.descricao}
                                        onChange={(e) => setModuloForm({ ...moduloForm, descricao: e.target.value })}
                                        placeholder="O que os alunos aprenderão neste módulo?"
                                        rows={2}
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2">
                                            Ícone
                                        </label>
                                        <input
                                            type="text"
                                            value={moduloForm.icone}
                                            onChange={(e) => setModuloForm({ ...moduloForm, icone: e.target.value })}
                                            placeholder="🚀"
                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-center text-2xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2 text-center">
                                            Ordem
                                        </label>
                                        <input
                                            type="number"
                                            value={moduloForm.ordem}
                                            onChange={(e) => setModuloForm({ ...moduloForm, ordem: parseInt(e.target.value) || 1 })}
                                            min={1}
                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary text-center outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2 text-center">
                                            XP
                                        </label>
                                        <input
                                            type="number"
                                            value={moduloForm.xp_recompensa}
                                            onChange={(e) => setModuloForm({ ...moduloForm, xp_recompensa: parseInt(e.target.value) || 50 })}
                                            min={0}
                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary text-center outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => {
                                        setShowModuloModal(false);
                                        setEditingModulo(null);
                                    }}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-xl hover:bg-slate-200 dark:hover:bg-border-hover transition-all font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={editingModulo ? handleUpdateModulo : handleCreateModulo}
                                    disabled={saving}
                                    className="flex-1 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all font-medium shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <><Loader className="w-5 h-5 animate-spin" /> Salvando...</> : editingModulo ? 'Salvar Alterações' : 'Criar Módulo'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Lição */}
            <AnimatePresence>
                {showLicaoModal && (
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
                                <Plus className="w-6 h-6 text-emerald-500" /> Adicionar Lição
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2">
                                        Escolha o Exercício
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={licaoForm.exercicio_id}
                                            onChange={(e) => setLicaoForm({ ...licaoForm, exercicio_id: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value={0}>Selecione...</option>
                                            {exercicios.map((ex) => (
                                                <option key={ex.id} value={ex.id}>
                                                    {ex.titulo}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2 text-center">
                                            Ordem
                                        </label>
                                        <input
                                            type="number"
                                            value={licaoForm.ordem}
                                            onChange={(e) => setLicaoForm({ ...licaoForm, ordem: parseInt(e.target.value) || 1 })}
                                            min={1}
                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary text-center outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-text-secondary uppercase tracking-wider mb-2 text-center">
                                            XP Recompensa
                                        </label>
                                        <input
                                            type="number"
                                            value={licaoForm.xp_recompensa}
                                            onChange={(e) => setLicaoForm({ ...licaoForm, xp_recompensa: parseInt(e.target.value) || 10 })}
                                            min={0}
                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl text-slate-900 dark:text-text-primary text-center outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowLicaoModal(null)}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-bg-tertiary text-slate-700 dark:text-text-secondary rounded-xl hover:bg-slate-200 dark:hover:bg-border-hover transition-all font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleCreateLicao(showLicaoModal)}
                                    disabled={saving}
                                    className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <><Loader className="w-5 h-5 animate-spin" /> Adicionando...</> : 'Adicionar Lição'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                    Remover {showDeleteModal.type === 'modulo' ? 'Módulo' : 'Lição'}
                                </h3>
                                <p className="text-slate-500 dark:text-text-secondary mb-8 leading-relaxed">
                                    Tem certeza que deseja remover este {showDeleteModal.type === 'modulo' ? 'módulo e todas as suas lições' : 'item'}? Esta ação não pode ser desfeita.
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
                                        onClick={handleDelete}
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
