'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

export default function CriarTurmaPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isProfessor = user?.tipo === 'professor';
    const isDesenvolvedor = user?.tipo === 'desenvolvedor';
    const canManage = isProfessor || isDesenvolvedor;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const turma = await apiClient.post<{ id: string }>('/turmas', {
                nome,
                descricao: descricao || undefined,
            });

            router.push(`/dashboard/turmas/${turma.id}`);
        } catch (err: any) {
            console.error('Erro ao criar turma:', err);
            setError(err.message || 'Erro ao criar turma. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-bg-primary">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated || !canManage) {
        router.push('/login');
        return null;
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
                                <Image
                                    src="/hu.png"
                                    alt="Senior Code AI Logo"
                                    width={32}
                                    height={32}
                                    className="w-8 h-8"
                                />
                                <span>Senior Code AI</span>
                            </Link>
                        </motion.div>
                        <div className="flex items-center gap-3">
                            <BackButton href="/dashboard/turmas" />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Conteúdo Principal */}
            <main className="flex-1 py-16 pt-32">
                <div className="container mx-auto px-6 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                                <BookOpen className="w-10 h-10" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-text-primary mb-2">
                                Criar Nova Turma
                            </h1>
                            <p className="text-slate-600 dark:text-text-secondary">
                                Configure sua turma e receba um código para compartilhar com os alunos
                            </p>
                        </div>

                        {/* Formulário */}
                        <div className="bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nome da Turma */}
                                <div>
                                    <label
                                        htmlFor="nome"
                                        className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2"
                                    >
                                        Nome da Turma *
                                    </label>
                                    <input
                                        id="nome"
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder="Ex: Lógica de Programação - 2024.1"
                                        required
                                        minLength={3}
                                        maxLength={255}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Descrição */}
                                <div>
                                    <label
                                        htmlFor="descricao"
                                        className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2"
                                    >
                                        Descrição (opcional)
                                    </label>
                                    <textarea
                                        id="descricao"
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        placeholder="Descreva o objetivo da turma, período, etc."
                                        rows={4}
                                        maxLength={500}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                    />
                                    <p className="mt-1 text-sm text-slate-500 dark:text-text-secondary">
                                        {descricao.length}/500 caracteres
                                    </p>
                                </div>

                                {/* Info Box */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                    <div className="flex gap-3">
                                        <Lightbulb className="w-6 h-6 text-blue-500" />
                                        <div>
                                            <p className="text-blue-800 dark:text-blue-300 font-medium">
                                                Código de Acesso Automático
                                            </p>
                                            <p className="text-blue-600 dark:text-blue-400 text-sm">
                                                Um código único de 8 caracteres será gerado automaticamente.
                                                Compartilhe com seus alunos para que eles possam entrar na turma.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Erro */}
                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                        <p className="text-red-700 dark:text-red-300">{error}</p>
                                    </div>
                                )}

                                {/* Botões */}
                                <div className="flex gap-4 pt-4">
                                    <Link
                                        href="/dashboard/turmas"
                                        className="flex-1 py-3 px-6 bg-slate-200 dark:bg-bg-tertiary text-slate-900 dark:text-text-primary rounded-lg hover:bg-slate-300 dark:hover:bg-border-hover transition-colors text-center font-medium"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={loading || nome.length < 3}
                                        className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Criando...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5" /> Criar Turma
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
