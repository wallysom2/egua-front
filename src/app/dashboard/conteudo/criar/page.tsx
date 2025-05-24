"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Linguagem {
  id: number;
  nome: string;
}

interface FormData {
  titulo: string;
  corpo: string;
  nivel_leitura: "basico" | "intermediario";
  linguagem_id: string;
}

interface EmojiData {
  native: string;
  id: string;
  name: string;
  unified: string;
}

const fetchLinguagens = async (token: string) => {
  const response = await fetch(`${API_URL}/linguagens`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao carregar linguagens");
  }

  return response.json();
};

const criarConteudo = async (formData: FormData, token: string) => {
  const response = await fetch(`${API_URL}/conteudos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...formData,
      linguagem_id: Number(formData.linguagem_id),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao criar conteúdo");
  }

  return response.json();
};

export default function NovoConteudoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    corpo: "",
    nivel_leitura: "basico",
    linguagem_id: "",
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.corpo,
    onUpdate: ({ editor }: { editor: Editor }) => {
      setFormData(prev => ({
        ...prev,
        corpo: editor.getHTML()
      }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none p-6 min-h-[400px] focus:outline-none text-slate-900 dark:text-white',
      },
    },
  });

  useEffect(() => {
    const carregarLinguagens = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const data = await fetchLinguagens(token);
        setLinguagens(data);
      } catch (err) {
        setError("Erro ao carregar linguagens. Tente novamente mais tarde.");
        console.error(err);
      }
    };

    carregarLinguagens();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      await criarConteudo(formData, token);
      router.push("/dashboard/conteudo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conteúdo");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmojiSelect = (emoji: EmojiData) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji.native).run();
    }
    setShowEmojiPicker(false);
  };

  const toolbarButtons = [
    {
      icon: "H1",
      label: "Título 1",
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor?.isActive('heading', { level: 1 }),
    },
    {
      icon: "H2",
      label: "Título 2", 
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor?.isActive('heading', { level: 2 }),
    },
    {
      icon: "B",
      label: "Negrito",
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive('bold'),
      bold: true,
    },
    {
      icon: "I",
      label: "Itálico",
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive('italic'),
      italic: true,
    },
    {
      icon: "• Lista",
      label: "Lista com marcadores",
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive('bulletList'),
    },
    {
      icon: "1. Lista",
      label: "Lista numerada",
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor?.isActive('orderedList'),
    },
    {
      icon: '</>',
      label: "Bloco de código",
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor?.isActive('codeBlock'),
    },
    {
      icon: '"',
      label: "Citação",
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      isActive: () => editor?.isActive('blockquote'),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 hover:scale-105 transition-transform"
              >
                🏛️ <span>Égua</span>
              </Link>
              <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
                <span>›</span>
                <Link href="/dashboard/conteudo" className="hover:text-slate-900 dark:hover:text-white transition-colors">Conteúdo</Link>
                <span>›</span>
                <span className="text-slate-900 dark:text-white font-medium">Criar Novo</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
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

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
            ➕ Criar Novo Conteúdo
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Crie materiais didáticos estruturados para enriquecer a biblioteca de conhecimento
          </p>
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
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
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
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                📝 Informações Básicas
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
                    value={formData.titulo}
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
                    value={formData.nivel_leitura}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="basico">🌱 Básico</option>
                    <option value="intermediario">🚀 Intermediário</option>
                  </select>
                </div>

                {/* Linguagem */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Linguagem de Programação
                  </label>
                  <select
                    name="linguagem_id"
                    value={formData.linguagem_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selecione uma linguagem...</option>
                    {linguagens.map((linguagem) => (
                      <option key={linguagem.id} value={linguagem.id}>
                        💻 {linguagem.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  ✍️ Conteúdo do Material
                </h2>
                
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {toolbarButtons.map((button, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={button.action}
                      className={`px-3 py-2 text-sm rounded transition-colors ${
                        button.isActive?.() 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                      } ${button.bold ? 'font-bold' : ''} ${button.italic ? 'italic' : ''}`}
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
                      <div className="absolute top-12 right-0 z-50">
                        <Picker 
                          data={data} 
                          onEmojiSelect={handleEmojiSelect}
                          theme="dark"
                        />
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
                disabled={loading || !formData.titulo.trim() || !formData.corpo.trim() || !formData.linguagem_id}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    ✅ Criar Conteúdo
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

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
        .prose-editor .ProseMirror ul, .prose-editor .ProseMirror ol {
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