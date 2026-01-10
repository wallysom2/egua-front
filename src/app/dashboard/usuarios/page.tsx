'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
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
            {/* Navbar */}
            <div className="fixed w-full z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link
                        href="/dashboard"
                        className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
                    >
                        <Image
                            src="/hu.png"
                            alt="Senior Code AI Logo"
                            width={40}
                            height={40}
                            className="w-10 h-10"
                        />
                        Senior Code AI
                    </Link>
                    <div className="flex items-center gap-3">
                        <BackButton href="/dashboard" />
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="container mx-auto px-4 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Gerenciar Usuários
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                Total: {usuarios.length} usuários cadastrados
                            </p>
                        </div>

                        {/* Estatísticas */}
                        <div className="flex gap-4">
                            <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                                <span className="text-green-700 dark:text-green-300 font-medium">
                                    {usuarios.filter(u => u.tipo === 'aluno').length} Alunos
                                </span>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                                <span className="text-blue-700 dark:text-blue-300 font-medium">
                                    {usuarios.filter(u => u.tipo === 'professor').length} Professores
                                </span>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-lg">
                                <span className="text-purple-700 dark:text-purple-300 font-medium">
                                    {usuarios.filter(u => u.tipo === 'desenvolvedor').length} Devs
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou email..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="todos">Todos os tipos</option>
                                    <option value="aluno">Alunos</option>
                                    <option value="professor">Professores</option>
                                    <option value="desenvolvedor">Desenvolvedores</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Erro */}
                    {error && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                            {error}
                            <button
                                onClick={() => setError(null)}
                                className="ml-2 text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Tabela de Usuários */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Usuário
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Cadastro
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {usuariosFiltrados.map((usuario) => (
                                        <tr
                                            key={usuario.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                                        {usuario.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-slate-900 dark:text-white">
                                                        {usuario.nome}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {usuario.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={usuario.tipo}
                                                    onChange={(e) => handleAlterarTipo(usuario.id, e.target.value)}
                                                    disabled={alterandoTipo === usuario.id || usuario.id === user?.id}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoBadgeColor(usuario.tipo)} border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                                                >
                                                    <option value="aluno">Aluno</option>
                                                    <option value="professor">Professor</option>
                                                    <option value="desenvolvedor">Desenvolvedor</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                                {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {confirmDelete === usuario.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleDeleteUsuario(usuario.id)}
                                                                disabled={deletando === usuario.id}
                                                                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                                            >
                                                                {deletando === usuario.id ? 'Excluindo...' : 'Confirmar'}
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDelete(null)}
                                                                className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmDelete(usuario.id)}
                                                            disabled={usuario.id === user?.id}
                                                            className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title={usuario.id === user?.id ? 'Você não pode excluir sua própria conta' : 'Excluir usuário'}
                                                        >
                                                            Excluir
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {usuariosFiltrados.length === 0 && (
                                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                    Nenhum usuário encontrado
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
