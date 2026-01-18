'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
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
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated || !canManage) {
        router.push('/login');
        return null;
    }

    return (
        <>
            <Header
                variant="dashboard"
                user={user}
                onLogout={signOut}
                extraActions={<BackButton href="/dashboard/turmas" />}
            />

            <main className="flex-grow py-8 sm:py-16 pt-20 sm:pt-28 flex flex-col justify-center">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl mx-auto"
                    >
                        <div className="bg-white dark:bg-bg-secondary rounded-2xl p-8 md:p-12 shadow-xl border border-slate-200 dark:border-border-custom">
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/20">
                                    <Plus className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label
                                        htmlFor="nome"
                                        className="block text-sm font-semibold text-slate-700 dark:text-text-secondary mb-3 uppercase tracking-wider"
                                    >
                                        Nome da Turma
                                    </label>
                                    <input
                                        type="text"
                                        id="nome"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder="Ex: 9º Ano A - Pensamento Computacional"
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-lg"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
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
        </>
    );
}
