'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';

import { API_BASE_URL } from '@/config/api';

interface Linguagem {
  id: number;
  nome: string;
}

interface Conteudo {
  id: number;
  titulo: string;
  corpo: string;
  nivel_leitura: 'basico' | 'intermediario';
  linguagem_id: number;
}

interface EmojiObject {
  native: string;
}

interface ToolbarButton {
  icon: string;
  label: string;
  action: () => void;
  isActive?: () => boolean | undefined;
  bold?: boolean;
  italic?: boolean;
}

const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token não encontrado');
  }
  return token;
};

const fetchLinguagens = async (token: string): Promise<Linguagem[]> => {
  const response = await fetch(`${API_BASE_URL}/linguagens`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar linguagens');
  }

  return response.json();
};

const fetchConteudo = async (id: string, token: string): Promise<Conteudo> => {
  const response = await fetch(`${API_BASE_URL}/conteudos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar conteúdo');
  }

  return response.json();
};

const atualizarConteudo = async (
  id: string,
  conteudo: Conteudo,
  token: string,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/conteudos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(conteudo),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao atualizar conteúdo');
  }
};

const useConteudo = (id: string) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formData, setFormData] = useState<Conteudo>({
    id: 0,
    titulo: '',
    corpo: '',
    nivel_leitura: 'basico',
    linguagem_id: 0,
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.corpo || '',
    immediatelyRender: false,
    onUpdate: ({ editor }: { editor: Editor }) => {
      const html = editor.getHTML();
      setFormData((prev) => ({
        ...prev,
        corpo: html,
      }));
    },
    editable: true,
    editorProps: {
      attributes: {
        class:
          'prose prose-slate dark:prose-invert max-w-none p-6 min-h-[400px] focus:outline-none text-slate-900 dark:text-white',
      },
    },
  });

  useEffect(() => {
    if (editor && formData.corpo && editor.getHTML() !== formData.corpo) {
      editor
        .chain()
        .setContent(formData.corpo || '')
        .run();
    }
  }, [editor, formData.corpo]);

  const carregarDados = useCallback(async () => {
    try {
      const token = getToken();
      const [linguagensData, conteudoData] = await Promise.all([
        fetchLinguagens(token),
        fetchConteudo(id, token),
      ]);

      setLinguagens(linguagensData);
      setFormData(conteudoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const salvarConteudo = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = getToken();
      await atualizarConteudo(id, formData, token);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar conteúdo',
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const atualizarCampo = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'linguagem_id' ? Number(value) : value,
    }));
  };

  const handleEmojiSelect = (emoji: EmojiObject) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji.native).run();
    }
    setShowEmojiPicker(false);
  };

  const toolbarButtons = [
    {
      icon: 'H1',
      label: 'Título 1',
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor?.isActive('heading', { level: 1 }),
    },
    {
      icon: 'H2',
      label: 'Título 2',
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor?.isActive('heading', { level: 2 }),
    },
    {
      icon: 'B',
      label: 'Negrito',
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive('bold'),
      bold: true,
    },
    {
      icon: 'I',
      label: 'Itálico',
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive('italic'),
      italic: true,
    },
    {
      icon: '• Lista',
      label: 'Lista com marcadores',
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive('bulletList'),
    },
    {
      icon: '1. Lista',
      label: 'Lista numerada',
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor?.isActive('orderedList'),
    },
    {
      icon: '</>',
      label: 'Bloco de código',
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor?.isActive('codeBlock'),
    },
    {
      icon: '"',
      label: 'Citação',
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      isActive: () => editor?.isActive('blockquote'),
    },
  ];

  return {
    loading,
    saving,
    error,
    linguagens,
    showEmojiPicker,
    setShowEmojiPicker,
    formData,
    atualizarCampo,
    salvarConteudo,
    handleEmojiSelect,
    toolbarButtons,
    editor,
  };
};


const FormularioConteudo = ({
  formData,
  linguagens,
  saving,
  error,
  editor,
  showEmojiPicker,
  setShowEmojiPicker,
  handleChange,
  handleSubmit,
  onCancel,
  toolbarButtons,
}: {
  formData: Conteudo;
  linguagens: Linguagem[];
  saving: boolean;
  error: string | null;
  editor: Editor | null;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  handleEmojiSelect: (emoji: EmojiObject) => void;
  toolbarButtons: ToolbarButton[];
}) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors">
    {/* Navbar */}
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
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
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.div>

    {/* Botão Voltar */}
    <BackButton href="/dashboard/conteudo" />

    {/* Conteúdo Principal */}
    <main className="flex-1 py-16 pt-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Editar Conteúdo
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Atualize as informações do conteúdo
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">⚠️</span>
              <div>
                <p className="font-medium text-sm">Erro ao salvar conteúdo</p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                Informações Básicas
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Título */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Título do Conteúdo
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo || ''}
                    onChange={handleChange}
                    required
                    placeholder="Digite um título claro e descritivo..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Nível */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nível de Dificuldade
                  </label>
                  <select
                    name="nivel_leitura"
                    value={formData.nivel_leitura || 'basico'}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="basico">Básico</option>
                    <option value="intermediario">Intermediário</option>
                  </select>
                </div>

                {/* Linguagem */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Linguagem de Programação
                  </label>
                  <select
                    name="linguagem_id"
                    value={formData.linguagem_id || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selecione uma linguagem...</option>
                    {linguagens.map((linguagem) => (
                      <option key={linguagem.id} value={linguagem.id}>
                        {linguagem.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  Conteúdo do Material
                </h2>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {toolbarButtons.map((button, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={button.action}
                      className={`px-3 py-2 text-sm rounded-md transition-all duration-150 ${
                        button.isActive?.()
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 hover:shadow-sm'
                      } ${button.bold ? 'font-bold' : ''} ${
                        button.italic ? 'italic' : ''
                      }`}
                      title={button.label}
                    >
                      {button.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-b-xl bg-slate-50 dark:bg-slate-800 overflow-hidden">
                <EditorContent
                  editor={editor}
                  className="min-h-[400px] prose-editor"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2 font-medium"
              >
                ← Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  !formData.titulo?.trim() ||
                  !formData.corpo?.trim() ||
                  !formData.linguagem_id
                }
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>Salvar Alterações</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </main>

    {/* Click outside to close emoji picker */}
    {showEmojiPicker && (
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowEmojiPicker(false)}
      />
    )}

    <style jsx global>{`
      .prose-editor .ProseMirror {
        outline: none;
      }
      .prose-editor .ProseMirror h1 {
        @apply text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-6 first:mt-0;
      }
      .prose-editor .ProseMirror h2 {
        @apply text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 mt-5;
      }
      .prose-editor .ProseMirror h3 {
        @apply text-lg font-bold text-slate-700 dark:text-slate-300 mb-2 mt-4;
      }
      .prose-editor .ProseMirror p {
        @apply text-slate-700 dark:text-slate-300 leading-relaxed mb-4;
      }
      .prose-editor .ProseMirror ul,
      .prose-editor .ProseMirror ol {
        @apply text-slate-700 dark:text-slate-300 mb-4 pl-6;
      }
      .prose-editor .ProseMirror li {
        @apply mb-2;
      }
      .prose-editor .ProseMirror code {
        @apply bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1 rounded text-sm;
      }
      .prose-editor .ProseMirror pre {
        @apply bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto my-4;
      }
      .prose-editor .ProseMirror blockquote {
        @apply border-l-4 border-blue-500 pl-4 italic text-slate-600 dark:text-slate-400 my-4 bg-blue-50 dark:bg-blue-900/20 py-2;
      }
      .prose-editor .ProseMirror strong {
        @apply font-bold text-slate-900 dark:text-white;
      }
      .prose-editor .ProseMirror em {
        @apply italic text-slate-700 dark:text-slate-300;
      }
    `}</style>
  </div>
);

export default function EditarConteudoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [id, setId] = useState<string>('');
  const [paramsLoaded, setParamsLoaded] = useState(false);

  // Verificar permissões
  const isProfessor = user?.tipo === 'professor';
  const isDesenvolvedor = user?.tipo === 'desenvolvedor';
  const temPermissao = isProfessor || isDesenvolvedor;

  // Resolver o params Promise
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setId(resolvedParams.id);
        setParamsLoaded(true);
      } catch (error) {
        console.error('Erro ao resolver params:', error);
        router.push('/dashboard/conteudo');
      }
    };

    resolveParams();
  }, [params, router]);

  // Verificar autenticação e permissões
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (authLoading || !isAuthenticated) {
      return;
    }

    // Verificar se o usuário tem permissão
    if (user && user.tipo !== 'professor' && user.tipo !== 'desenvolvedor') {
      router.push('/dashboard');
      return;
    }
  }, [router, user, isAuthenticated, authLoading]);

  const {
    loading,
    saving,
    error,
    linguagens,
    showEmojiPicker,
    setShowEmojiPicker,
    formData,
    atualizarCampo,
    salvarConteudo,
    handleEmojiSelect,
    toolbarButtons,
    editor,
  } = useConteudo(id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sucesso = await salvarConteudo();
    if (sucesso) {
      router.push(`/dashboard/conteudo/${id}`);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/conteudo/${id}`);
  };

  // Mostrar loading enquanto params não estão carregados ou dados estão sendo carregados
  if (!paramsLoaded || loading) {
    return <Loading text="Carregando conteúdo..." />;
  }

  if (!temPermissao) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Acesso Negado
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
            Você não tem permissão para editar conteúdos. Apenas professores e
            desenvolvedores podem acessar esta área.
          </p>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Voltar ao Painel
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <FormularioConteudo
      formData={formData}
      linguagens={linguagens}
      saving={saving}
      error={error}
      editor={editor}
      showEmojiPicker={showEmojiPicker}
      setShowEmojiPicker={setShowEmojiPicker}
      handleChange={atualizarCampo}
      handleSubmit={handleSubmit}
      onCancel={handleCancel}
      handleEmojiSelect={handleEmojiSelect}
      toolbarButtons={toolbarButtons}
    />
  );
}
