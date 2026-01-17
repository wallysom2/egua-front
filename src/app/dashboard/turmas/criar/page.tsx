'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Check } from 'lucide-react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

export default function CriarTurmaPage() {
    const router = useRouter();
    const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();
    const [nome, setNome] = useState('');
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
            <Header
                variant="dashboard"
                user={user}
                onLogout={signOut}
                extraActions={
                    <BackButton href="/dashboard/turmas" />
                }
            />

            {/* Conteúdo Principal */}
            <main className="flex-grow py-16 pt-32 flex items-center justify-center">
                <div className="container mx-auto px-6 max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Card */}
                        <div className="bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom">
                            {/* Header do Card */}
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-text-primary">
                                    Nova Turma
                                </h1>
                            </div>

                            {/* Formulário */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nome da Turma */}
                                <div>
                                    <label
                                        htmlFor="nome"
                                        className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2"
                                    >
                                        Nome da Turma
                                    </label>
                                    <input
                                        id="nome"
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder="Ex: Lógica de Programação 2024"
                                        required
                                        minLength={3}
                                        maxLength={255}
                                        autoFocus
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Erro */}
                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Botão */}
                                <button
                                    type="submit"
                                    disabled={loading || nome.length < 3}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            </form>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-200 dark:footer-border-custom bg-slate-50/30 footer-bg mt-auto">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-slate-600 dark:text-text-secondary">
                        Senior Code AI
                    </p>
                </div>
            </footer>
        </div>
    );
}

