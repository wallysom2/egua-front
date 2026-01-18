'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Search, Filter, Trash2, ShieldCheck, GraduationCap, UserCog, UserCircle, Mail, Calendar, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

interface Usuario {
    id: string;
    nome: string;
    email: string;
    tipo: 'aluno' | 'professor' | 'desenvolvedor';
    created_at: string;
    updated_at: string;
}

export default function GerenciarUsuarios() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');
    const [busca, setBusca] = useState('');
    const [deletando, setDeletando] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [alterandoTipo, setAlterandoTipo] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Apenas desenvolvedores podem acessar
        if (user && user.tipo !== 'desenvolvedor') {
            router.push('/dashboard');
            return;
        }

        fetchUsuarios();
    }, [authLoading, isAuthenticated, user, router]);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<{ success: boolean; data: Usuario[] }>('/usuarios');
            setUsuarios(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUsuario = async (id: string) => {
        try {
            setDeletando(id);
            await apiClient.delete(`/usuarios/${id}`);
            setUsuarios(usuarios.filter(u => u.id !== id));
            setConfirmDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir usuário');
        } finally {
            setDeletando(null);
        }
    };

    const handleAlterarTipo = async (id: string, novoTipo: string) => {
        try {
            setAlterandoTipo(id);
            await apiClient.patch(`/usuarios/${id}/tipo`, { tipo: novoTipo });
            setUsuarios(usuarios.map(u =>
                u.id === id ? { ...u, tipo: novoTipo as Usuario['tipo'] } : u
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao alterar tipo');
        } finally {
            setAlterandoTipo(null);
        }
    };

    const usuariosFiltrados = usuarios.filter(u => {
        const matchTipo = filtroTipo === 'todos' || u.tipo === filtroTipo;
        const matchBusca = u.nome.toLowerCase().includes(busca.toLowerCase()) ||
            u.email.toLowerCase().includes(busca.toLowerCase());
        return matchTipo && matchBusca;
    });

    const getTipoBadgeColor = (tipo: string) => {
        switch (tipo) {
            case 'desenvolvedor':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'professor':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'aluno':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    if (authLoading || loading) {
        return <Loading text="Carregando usuários..." size="lg" />;
    }

    if (user?.tipo !== 'desenvolvedor') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors">
            <Header
                variant="dashboard"
                user={user}
                onLogout={() => router.push('/logout')}
                extraActions={<BackButton href="/dashboard" />}
            />

            {/* Conteúdo */}
            <main className="flex-grow py-8 sm:py-12 pt-20 sm:pt-24 bg-slate-50 dark:bg-bg-primary">
                <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Header */}
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-text-primary tracking-tight mb-2">
                                Gerenciar Usuários
                            </h1>
                            <p className="text-slate-600 dark:text-text-secondary">
                                Total de <span className="font-bold text-brand-600 dark:text-brand-500">{usuarios.length}</span> usuários cadastrados na plataforma.
                            </p>
                        </div>

                        {/* Estatísticas - Grid responsivo */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="bg-white dark:bg-bg-secondary p-5 rounded-2xl border border-slate-200 dark:border-border-custom shadow-sm flex items-center gap-4"
                            >
                                <div className="p-3 bg-brand-500/10 rounded-xl">
                                    <GraduationCap className="w-6 h-6 text-brand-600 dark:text-brand-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-text-tertiary">Alunos</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-text-primary">
                                        {usuarios.filter(u => u.tipo === 'aluno').length}
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -4 }}
                                className="bg-white dark:bg-bg-secondary p-5 rounded-2xl border border-slate-200 dark:border-border-custom shadow-sm flex items-center gap-4"
                            >
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <UserCog className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-text-tertiary">Professores</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-text-primary">
                                        {usuarios.filter(u => u.tipo === 'professor').length}
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -4 }}
                                className="bg-white dark:bg-bg-secondary p-5 rounded-2xl border border-slate-200 dark:border-border-custom shadow-sm flex items-center gap-4"
                            >
                                <div className="p-3 bg-purple-500/10 rounded-xl">
                                    <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-text-tertiary">Desenvolvedores</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-text-primary">
                                        {usuarios.filter(u => u.tipo === 'desenvolvedor').length}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Barra de Busca e Filtro */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou email..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-bg-secondary border border-slate-200 dark:border-border-custom rounded-2xl text-slate-900 dark:text-text-primary placeholder-slate-400 focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative min-w-[200px]">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-bg-secondary border border-slate-200 dark:border-border-custom rounded-2xl text-slate-900 dark:text-text-primary outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer transition-all shadow-sm"
                                >
                                    <option value="todos">Todos os tipos</option>
                                    <option value="aluno">Alunos</option>
                                    <option value="professor">Professores</option>
                                    <option value="desenvolvedor">Desenvolvedores</option>
                                </select>
                            </div>
                        </div>

                        {/* Erro */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl mb-8 flex items-center justify-between">
                                <span className="font-medium">{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className="p-1 hover:bg-black/5 rounded-full transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Lista de Usuários - Grid de Cards responsivos */}
                        <div className="grid grid-cols-1 gap-4">
                            {usuariosFiltrados.map((usuario, index) => (
                                <motion.div
                                    key={usuario.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-bg-secondary rounded-2xl border border-slate-200 dark:border-border-custom p-5 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xl font-bold shadow-sm group-hover:scale-105 transition-transform">
                                                {usuario.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-text-primary group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                    {usuario.nome}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-text-secondary">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {usuario.email}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 ml-0 sm:ml-auto">
                                            {/* Data de Cadastro - Hidden mobile short, shown desktop */}
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-bg-tertiary rounded-xl text-xs font-medium text-slate-500 dark:text-text-secondary border border-transparent dark:border-border-custom">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Cadastrado em:</span> {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                                            </div>

                                            {/* Selector de Tipo */}
                                            <div className="relative">
                                                <select
                                                    value={usuario.tipo}
                                                    onChange={(e) => handleAlterarTipo(usuario.id, e.target.value)}
                                                    disabled={alterandoTipo === usuario.id || usuario.id === user?.id}
                                                    className={`pl-3 pr-8 py-1.5 rounded-xl text-sm font-semibold border-none ring-1 ring-inset ring-slate-200 dark:ring-border-custom cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 appearance-none shadow-sm ${getTipoBadgeColor(usuario.tipo)}`}
                                                >
                                                    <option value="aluno">Aluno</option>
                                                    <option value="professor">Professor</option>
                                                    <option value="desenvolvedor">Desenvolvedor</option>
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                                </div>
                                            </div>

                                            {/* Botão Excluir / Confirmar */}
                                            <div className="flex items-center gap-2">
                                                {confirmDelete === usuario.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleDeleteUsuario(usuario.id)}
                                                            disabled={deletando === usuario.id}
                                                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                                                        >
                                                            {deletando === usuario.id ? (
                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                            Confirmar
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(null)}
                                                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-text-secondary transition-colors"
                                                        >
                                                            ✕
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmDelete(usuario.id)}
                                                        disabled={usuario.id === user?.id}
                                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={usuario.id === user?.id ? 'Você não pode excluir sua própria conta' : 'Excluir usuário'}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {usuariosFiltrados.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-bg-secondary rounded-3xl border-2 border-dashed border-slate-200 dark:border-border-custom">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-1">Nenhum registro</h3>
                                    <p className="text-slate-500 dark:text-text-secondary">Não encontramos usuários com os critérios informados.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
