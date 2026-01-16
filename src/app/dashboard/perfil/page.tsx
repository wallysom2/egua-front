'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, Code, GraduationCap, UserCog } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface ToastNotification {
    id: string;
    type: 'success' | 'error';
    message: string;
}

export default function PerfilPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    // Form state
    const [nome, setNome] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

        if (user) {
            setNome(user.nome || '');
            setAvatarUrl(user.avatar_url || null);
        }
    }, [router, isAuthenticated, authLoading, user]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            addToast('error', 'Por favor, selecione uma imagem');
            return;
        }

        // Validar tamanho (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
            addToast('error', 'A imagem deve ter no máximo 2MB');
            return;
        }

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setAvatarPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Fazer upload para o Supabase
        setUploading(true);
        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload do arquivo
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                console.error('Erro ao fazer upload:', uploadError);
                addToast('error', 'Erro ao fazer upload da imagem');
                setAvatarPreview(null);
                return;
            }

            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            addToast('success', 'Imagem carregada com sucesso!');
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            addToast('error', 'Erro ao fazer upload da imagem');
            setAvatarPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nome.trim()) {
            addToast('error', 'O nome é obrigatório');
            return;
        }

        setLoading(true);
        try {
            const supabase = createClient();

            // Atualizar metadados do usuário no Supabase
            const { error } = await supabase.auth.updateUser({
                data: {
                    nome: nome.trim(),
                    full_name: nome.trim(),
                    avatar_url: avatarUrl || avatarPreview || undefined,
                },
            });

            if (error) {
                throw error;
            }

            // Atualizar contexto
            if (refreshUser) {
                await refreshUser();
            }

            addToast('success', 'Perfil atualizado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error);
            addToast('error', error.message || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        const parts = name.split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    if (authLoading) {
        return <Loading text="Carregando perfil..." />;
    }

    const displayAvatar = avatarPreview || avatarUrl;

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
                            <BackButton href="/dashboard" />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Conteúdo Principal */}
            <main className="flex-1 py-16 pt-32 flex items-center justify-center">
                <div className="container mx-auto px-6 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >


                        {/* Card do Formulário */}
                        <div className="bg-white dark:bg-bg-secondary rounded-xl p-8 shadow-lg border border-slate-200 dark:border-border-custom">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Avatar */}
                                <div className="flex flex-col items-center">
                                    <div className="relative group">
                                        {displayAvatar ? (
                                            <img
                                                src={displayAvatar}
                                                alt="Avatar"
                                                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-blue-700 shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                                {nome ? getInitials(nome) : '?'}
                                            </div>
                                        )}

                                        {/* Overlay de upload */}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            {uploading ? (
                                                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Camera className="w-8 h-8 text-white" />
                                            )}
                                        </button>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    <p className="mt-3 text-sm text-slate-500 dark:text-text-secondary">
                                        Clique na foto para alterar
                                    </p>
                                </div>

                                {/* Nome */}
                                <div>
                                    <label
                                        htmlFor="nome"
                                        className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2"
                                    >
                                        Nome Completo
                                    </label>
                                    <input
                                        id="nome"
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder="Seu nome"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-bg-tertiary border border-slate-300 dark:border-border-custom rounded-lg text-slate-900 dark:text-text-primary placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Email (readonly) */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-100 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-lg text-slate-500 dark:text-text-tertiary cursor-not-allowed"
                                    />
                                </div>

                                {/* Tipo de Conta (readonly) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-text-secondary mb-2">
                                        Tipo de Conta
                                    </label>
                                    <div className="px-4 py-3 bg-slate-100 dark:bg-bg-tertiary border border-slate-200 dark:border-border-custom rounded-lg">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${user?.tipo === 'desenvolvedor'
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                            : user?.tipo === 'professor'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            }`}>
                                            {user?.tipo === 'desenvolvedor' && <Code className="w-4 h-4" />}
                                            {user?.tipo === 'professor' && <UserCog className="w-4 h-4" />}
                                            {user?.tipo === 'aluno' && <GraduationCap className="w-4 h-4" />}
                                            <span className="capitalize">{user?.tipo || 'Usuário'}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Botão de Salvar */}
                                <button
                                    type="submit"
                                    disabled={loading || uploading}
                                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
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
