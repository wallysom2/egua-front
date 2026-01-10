'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackButton } from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

// Lista de emojis comuns para o picker simples
const COMMON_EMOJIS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '☹️',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '😱',
  '😨',
  '😰',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
  '😶',
  '😐',
  '😑',
  '😬',
  '🙄',
  '😯',
  '😦',
  '😧',
  '😮',
  '😲',
  '🥱',
  '😴',
  '🤤',
  '😪',
  '😵',
  '🤐',
  '🥴',
  '🤢',
  '🤮',
  '🤧',
  '😷',
  '🤒',
  '🤕',
  '🤑',
  '🤠',
  '😈',
  '👍',
  '👎',
  '👌',
  '🤌',
  '🤏',
  '✌️',
  '🤞',
  '🤟',
  '🤘',
  '🤙',
  '👈',
  '👉',
  '👆',
  '🖕',
  '👇',
  '☝️',
  '👋',
  '🤚',
  '🖐️',
  '✋',
  '🖖',
  '👏',
  '🙌',
  '🤝',
  '🙏',
  '✍️',
  '💪',
  '🦾',
  '🦿',
  '🦵',
  '🦶',
  '👂',
  '🦻',
  '👃',
  '🧠',
  '🫀',
  '🫁',
  '🦷',
  '🦴',
  '👀',
  '👁️',
  '👅',
  '👄',
  '💋',
  '🩸',
  '💯',
  '💢',
  '💥',
  '💫',
  '💦',
  '💨',
  '🕳️',
  '💣',
  '💬',
  '👁️‍🗨️',
  '🗨️',
  '🗯️',
  '💭',
  '💤',
  '🔥',
  '⭐',
  '🌟',
  '✨',
  '⚡',
  '☄️',
  '💥',
  '🔥',
  '🌈',
  '☀️',
  '🌤️',
  '⛅',
  '🌦️',
  '🌧️',
  '⛈️',
  '🌩️',
  '🌨️',
  '❄️',
  '☃️',
  '⛄',
  '🌬️',
  '💨',
  '💧',
  '💦',
  '☔',
  '☂️',
  '🌊',
  '🌍',
  '🌎',
  '🌏',
  '🌕',
];

interface Linguagem {
  id: number;
  nome: string;
}

interface FormData {
  titulo: string;
  corpo: string;
  nivel_leitura: 'basico' | 'intermediario';
  linguagem_id: string;
}

export default function NovoConteudoPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    corpo: '',
    nivel_leitura: 'basico',
    linguagem_id: '',
  });

  // Verificar permissões
  const isProfessor = user?.tipo === 'professor';
  const isDesenvolvedor = user?.tipo === 'desenvolvedor';
  const temPermissao = isProfessor || isDesenvolvedor;

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: formData.corpo || '',
    immediatelyRender: false,
    onUpdate: ({ editor }: { editor: Editor }) => {
      setFormData((prev) => ({
        ...prev,
        corpo: editor.getHTML(),
      }));
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-slate dark:prose-invert max-w-none p-6 min-h-[400px] focus:outline-none text-slate-900 dark:text-white',
      },
    },
  });

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

    const carregarLinguagens = async () => {
      try {
        const data = await apiClient.get<Linguagem[]>('/linguagens');
        setLinguagens(data);

        // Definir Egua como padrão
        const eguaLang = data.find(
          (l: Linguagem) =>
            l.nome.toLowerCase() === 'egua' || l.nome.toLowerCase() === 'égua',
        );
        if (eguaLang) {
          setFormData((prev) => ({ ...prev, linguagem_id: String(eguaLang.id) }));
        }
      } catch (err) {
        setError('Erro ao carregar linguagens. Tente novamente mais tarde.');
        console.error(err);
      }
    };

    carregarLinguagens();
  }, [router, user, isAuthenticated, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/conteudos', {
        titulo: formData.titulo,
        corpo: formData.corpo,
        nivel_leitura: formData.nivel_leitura || 'basico',
        linguagem_id: Number(formData.linguagem_id),
      });
      router.push('/dashboard/conteudo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
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
    {
      icon: '🖼️',
      label: 'Imagem',
      action: () => {
        const url = window.prompt('URL da imagem:');
        if (url) {
          editor?.chain().focus().setImage({ src: url }).run();
        }
      },
      isActive: () => editor?.isActive('image'),
    },
  ];

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
            Você não tem permissão para criar conteúdos. Apenas professores e
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
              <BackButton href="/dashboard/conteudo" />
              <ThemeToggle />
              <Link
                href="/dashboard/conteudo"
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                ← Cancelar
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

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
              Criar Novo Conteúdo
            </h1>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-medium">Erro ao criar conteúdo</p>
                  <p className="text-sm text-red-600 dark:text-red-300">
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
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
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

                  {/* Nível de Leitura */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nível de Leitura
                    </label>
                    <select
                      name="nivel_leitura"
                      value={formData.nivel_leitura}
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
                      Linguagem
                    </label>
                    <select
                      name="linguagem_id"
                      value={formData.linguagem_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione uma linguagem</option>
                      {linguagens.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="bg-white dark:bg-slate-900/50 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">

                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    {toolbarButtons.map((button, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={button.action}
                        className={`px-3 py-2 text-sm rounded transition-colors ${button.isActive?.()
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                          } ${button.bold ? 'font-bold' : ''} ${button.italic ? 'italic' : ''
                          }`}
                        title={button.label}
                      >
                        {button.icon}
                      </button>
                    ))}

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="px-3 py-2 text-sm rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                        title="Adicionar emoji"
                      >
                        😊
                      </button>

                      {showEmojiPicker && (
                        <div className="absolute top-12 right-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 max-w-xs">
                          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                            {COMMON_EMOJIS.map((emoji, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() =>
                                  handleEmojiSelect({ native: emoji })
                                }
                                className="text-xl hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded transition-colors"
                                title={emoji}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Link
                  href="/dashboard/conteudo"
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  ← Cancelar e Voltar
                </Link>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.titulo?.trim() ||
                    !formData.corpo?.trim() ||
                    !formData.linguagem_id
                  }
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Criando...
                    </>
                  ) : (
                    <>Criar Conteúdo</>
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
}
