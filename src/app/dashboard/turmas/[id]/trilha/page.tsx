'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, BookOpen, BarChart2, Star, FileText, Pencil, Trash2, X } from 'lucide-react';
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
    type: 'success' | 'error';
    message: string;
}

export default function TrilhaConfigPage() {
    const router = useRouter();
    const params = useParams();
    const turmaId = params.id as string;
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [modulos, setModulos] = useState<Modulo[]>([]);
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    // Modal states
    const [showModuloModal, setShowModuloModal] = useState(false);
    const [showLicaoModal, setShowLicaoModal] = useState<string | null>(null);
    const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);

    // Form states
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

    const addToast = (type: 'success' | 'error', message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };

    const fetchTrilha = async () => {
        try {
            const data = await apiClient.get<Modulo[]>(`/turmas/${turmaId}/trilha`);
            setModulos(data);
        } catch (error) {
            console.error('Erro ao carregar trilha:', error);
            addToast('error', 'Erro ao carregar trilha');
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
            addToast('error', 'Título é obrigatório');
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
            addToast('success', 'Módulo criado com sucesso!');
        } catch (error: any) {
            addToast('error', error.message || 'Erro ao criar módulo');
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
            addToast('success', 'Módulo atualizado!');
        } catch (error: any) {
            addToast('error', error.message || 'Erro ao atualizar módulo');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteModulo = async (moduloId: string) => {
        if (!confirm('Tem certeza que deseja remover este módulo?')) return;

        try {
            await apiClient.delete(`/turmas/${turmaId}/trilha/modulos/${moduloId}`);
            setModulos(modulos.filter((m) => m.id !== moduloId));
            addToast('success', 'Módulo removido!');
        } catch (error: any) {
            addToast('error', error.message || 'Erro ao remover módulo');
        }
    };

    const handleCreateLicao = async (moduloId: string) => {
        if (!licaoForm.exercicio_id) {
            addToast('error', 'Selecione um exercício');
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
            addToast('success', 'Lição adicionada!');
        } catch (error: any) {
            addToast('error', error.message || 'Erro ao adicionar lição');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLicao = async (licaoId: string, moduloId: string) => {
        if (!confirm('Tem certeza que deseja remover esta lição?')) return;

        try {
            await apiClient.delete(`/turmas/${turmaId}/trilha/licoes/${licaoId}`);
            setModulos(modulos.map((m) =>
                m.id === moduloId
                    ? { ...m, trilha_licao: m.trilha_licao.filter((l) => l.id !== licaoId) }
                    : m
            ));
            addToast('success', 'Lição removida!');
        } catch (error: any) {
            addToast('error', error.message || 'Erro ao remover lição');
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
                                onClick={openNewModulo}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" /> Novo Módulo
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
                            <Target className="w-8 h-8 inline mr-2" /> Configurar Trilha de Aprendizado
                        </h1>
                        <p className="text-slate-600 dark:text-text-secondary">
                            Organize módulos e lições para os alunos seguirem uma sequência de aprendizado
                        </p>
                    </motion.div>

                    {/* Lista de Módulos */}
                    {modulos.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom shadow-sm">
                            <div className="text-6xl mb-6"><BookOpen className="w-16 h-16 mx-auto text-slate-400" /></div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-text-primary mb-4">
                                Nenhum módulo criado
                            </h3>
                            <p className="text-slate-600 dark:text-text-secondary mb-8 max-w-md mx-auto">
                                Crie seu primeiro módulo para começar a montar a trilha de aprendizado dos alunos
                            </p>
                            <button
                                onClick={openNewModulo}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" /> Criar Primeiro Módulo
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {modulos.sort((a, b) => a.ordem - b.ordem).map((modulo, index) => (
                                <motion.div
                                    key={modulo.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom shadow-lg overflow-hidden"
                                >
                                    {/* Header do Módulo */}
                                    <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-b border-slate-200 dark:border-border-custom">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                                                    {modulo.icone || index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary">
                                                        {modulo.titulo}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-text-secondary">
                                                        <span><BarChart2 className="w-4 h-4 inline" /> Ordem: {modulo.ordem}</span>
                                                        <span><Star className="w-4 h-4 inline" /> {modulo.xp_recompensa} XP</span>
                                                        <span><FileText className="w-4 h-4 inline" /> {modulo.trilha_licao.length} lições</span>
                                                    </div>
                                                    {modulo.descricao && (
                                                        <p className="text-sm text-slate-500 dark:text-text-secondary mt-1">
                                                            {modulo.descricao}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModulo(modulo)}
                                                    className="p-2 text-slate-500 hover:text-purple-600 transition-colors"
                                                    title="Editar módulo"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteModulo(modulo.id)}
                                                    className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                                                    title="Remover módulo"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lições do Módulo */}
                                    <div className="p-6">
                                        {modulo.trilha_licao.length === 0 ? (
                                            <p className="text-center text-slate-500 dark:text-text-secondary py-4">
                                                Nenhuma lição neste módulo
                                            </p>
                                        ) : (
                                            <div className="space-y-3 mb-4">
                                                {modulo.trilha_licao.sort((a, b) => a.ordem - b.ordem).map((licao) => (
                                                    <div
                                                        key={licao.id}
                                                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-bg-tertiary rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 font-bold">
                                                                {licao.ordem}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900 dark:text-text-primary">
                                                                    {licao.exercicio.titulo}
                                                                </p>
                                                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                                                    +{licao.xp_recompensa} XP
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteLicao(licao.id, modulo.id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                                            title="Remover lição"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => openNewLicao(modulo.id)}
                                            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-border-custom text-slate-500 dark:text-text-secondary hover:border-purple-400 hover:text-purple-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" /> Adicionar Lição
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
                            className="bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom p-6 max-w-md w-full shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-6">
                                {editingModulo ? <><Pencil className="w-5 h-5 inline" /> Editar Módulo</> : <><Plus className="w-5 h-5 inline" /> Novo Módulo</>}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        value={moduloForm.titulo}
                                        onChange={(e) => setModuloForm({ ...moduloForm, titulo: e.target.value })}
                                        placeholder="Ex: Introdução à Programação"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={moduloForm.descricao}
                                        onChange={(e) => setModuloForm({ ...moduloForm, descricao: e.target.value })}
                                        placeholder="Descrição do módulo..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                            Ícone
                                        </label>
                                        <input
                                            type="text"
                                            value={moduloForm.icone}
                                            onChange={(e) => setModuloForm({ ...moduloForm, icone: e.target.value })}
                                            placeholder="📚"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-center text-2xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                            Ordem
                                        </label>
                                        <input
                                            type="number"
                                            value={moduloForm.ordem}
                                            onChange={(e) => setModuloForm({ ...moduloForm, ordem: parseInt(e.target.value) || 1 })}
                                            min={1}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                            XP
                                        </label>
                                        <input
                                            type="number"
                                            value={moduloForm.xp_recompensa}
                                            onChange={(e) => setModuloForm({ ...moduloForm, xp_recompensa: parseInt(e.target.value) || 50 })}
                                            min={0}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowModuloModal(false);
                                        setEditingModulo(null);
                                    }}
                                    className="flex-1 py-3 bg-slate-200 dark:bg-bg-tertiary text-slate-900 dark:text-text-primary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={editingModulo ? handleUpdateModulo : handleCreateModulo}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Salvando...' : editingModulo ? 'Salvar' : 'Criar'}
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
                            className="bg-white dark:bg-bg-secondary rounded-xl border border-slate-200 dark:border-border-custom p-6 max-w-md w-full shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-6">
                                <Plus className="w-5 h-5 inline" /> Adicionar Lição
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                        Exercício *
                                    </label>
                                    <select
                                        value={licaoForm.exercicio_id}
                                        onChange={(e) => setLicaoForm({ ...licaoForm, exercicio_id: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary"
                                    >
                                        <option value={0}>Selecione um exercício...</option>
                                        {exercicios.map((ex) => (
                                            <option key={ex.id} value={ex.id}>
                                                {ex.titulo}
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
                                            value={licaoForm.ordem}
                                            onChange={(e) => setLicaoForm({ ...licaoForm, ordem: parseInt(e.target.value) || 1 })}
                                            min={1}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                            XP Recompensa
                                        </label>
                                        <input
                                            type="number"
                                            value={licaoForm.xp_recompensa}
                                            onChange={(e) => setLicaoForm({ ...licaoForm, xp_recompensa: parseInt(e.target.value) || 10 })}
                                            min={0}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowLicaoModal(null)}
                                    className="flex-1 py-3 bg-slate-200 dark:bg-bg-tertiary text-slate-900 dark:text-text-primary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleCreateLicao(showLicaoModal)}
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
