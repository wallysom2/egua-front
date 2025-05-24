"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Linguagem {
  id: number;
  nome: string;
}

interface Conteudo {
  id: number;
  titulo: string;
  corpo: string;
  nivel_leitura: "basico" | "intermediario";
  linguagem_id: number;
}

interface EmojiData {
  native: string;
  id: string;
  name: string;
  unified: string;
}

const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token não encontrado");
  }
  return token;
};

const fetchLinguagens = async (token: string): Promise<Linguagem[]> => {
  const response = await fetch(`${API_URL}/linguagens`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao carregar linguagens");
  }

  return response.json();
};

const fetchConteudo = async (id: string, token: string): Promise<Conteudo> => {
  const response = await fetch(`${API_URL}/conteudos/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao carregar conteúdo");
  }

  return response.json();
};

const atualizarConteudo = async (id: string, conteudo: Conteudo, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/conteudos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(conteudo),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao atualizar conteúdo");
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
    titulo: "",
    corpo: "",
    nivel_leitura: "basico",
    linguagem_id: 0,
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.corpo,
    onUpdate: ({ editor }: { editor: Editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({
        ...prev,
        corpo: html
      }));
    },
    editable: true,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none p-4 min-h-[300px] focus:outline-none text-white',
      },
    },
  });

  useEffect(() => {
    if (editor && formData.corpo && editor.getHTML() !== formData.corpo) {
      editor.chain().setContent(formData.corpo).run();
    }
  }, [editor, formData.corpo]);

  const carregarDados = async () => {
    try {
      const token = getToken();
      const [linguagensData, conteudoData] = await Promise.all([
        fetchLinguagens(token),
        fetchConteudo(id, token)
      ]);

      setLinguagens(linguagensData);
      setFormData(conteudoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const salvarConteudo = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = getToken();
      await atualizarConteudo(id, formData, token);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar conteúdo");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const atualizarCampo = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "linguagem_id" ? Number(value) : value,
    }));
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

  return {
    loading,
    saving,
    error,
    linguagens,
    formData,
    editor,
    showEmojiPicker,
    setShowEmojiPicker,
    carregarDados,
    salvarConteudo,
    atualizarCampo,
    handleEmojiSelect,
    toolbarButtons
  };
};

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-xl font-semibold text-white">Carregando conteúdo...</p>
      <p className="text-slate-400 mt-2">Preparando o editor para você</p>
    </div>
  </div>
);

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
  handleEmojiSelect,
  toolbarButtons
}: {
  formData: Conteudo;
  linguagens: Linguagem[];
  saving: boolean;
  error: string | null;
  editor: Editor | null;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  handleEmojiSelect: (emoji: EmojiData) => void;
  toolbarButtons: any[];
}) => (
  <div className="min-h-screen bg-slate-950 text-white">
    <div className="container mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>›</span>
        <Link href="/dashboard/conteudo" className="hover:text-white transition-colors">Conteúdo</Link>
        <span>›</span>
        <span className="text-white">Editar Conteúdo</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            ✏️ Editar Conteúdo
          </h1>
          <p className="text-slate-400 text-lg">
            Modifique seu conteúdo educacional
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/conteudo"
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            ← Voltar
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-8 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Erro ao salvar conteúdo</p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <div className="bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-slate-800/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              📋 Informações Básicas
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-slate-300 mb-2">
                  📝 Título do Conteúdo
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  minLength={3}
                  placeholder="Digite um título atrativo..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="nivel_leitura" className="block text-sm font-medium text-slate-300 mb-2">
                  📊 Nível de Dificuldade
                </label>
                <select
                  id="nivel_leitura"
                  name="nivel_leitura"
                  value={formData.nivel_leitura}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="basico">🌱 Básico</option>
                  <option value="intermediario">🚀 Intermediário</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="linguagem_id" className="block text-sm font-medium text-slate-300 mb-2">
                  🔤 Linguagem de Programação
                </label>
                <select
                  id="linguagem_id"
                  name="linguagem_id"
                  value={formData.linguagem_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {linguagens.map((linguagem) => (
                    <option key={linguagem.id} value={linguagem.id}>
                      {linguagem.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Editor de Conteúdo */}
          <div className="bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-slate-800/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                ✍️ Editor de Conteúdo
              </h2>
              <p className="text-slate-400 text-sm">
                Use a barra de ferramentas para formatar seu texto
              </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              {toolbarButtons.map((button, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={button.action}
                  title={button.label}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                    button.isActive?.() 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  <span className={button.bold ? 'font-bold' : button.italic ? 'italic' : ''}>
                    {button.icon}
                  </span>
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Adicionar emoji"
                className="px-3 py-2 rounded text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
              >
                😊
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute z-50 mt-2">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="dark"
                />
              </div>
            )}

            {/* Editor */}
            <div className="border border-slate-700 rounded-lg bg-slate-800/30">
              <EditorContent 
                editor={editor} 
                className="min-h-[400px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:p-4 [&_.ProseMirror]:text-slate-200"
              />
            </div>
            
            <p className="text-slate-400 text-sm mt-2">
              💡 Dica: Use markdown ou a barra de ferramentas para formatar seu conteúdo
            </p>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-6 bg-slate-900/30 backdrop-blur rounded-xl border border-slate-800/30">
            <div className="text-center sm:text-left">
              <p className="text-slate-300 font-medium">Pronto para salvar?</p>
              <p className="text-slate-400 text-sm">Suas alterações serão aplicadas imediatamente</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors flex items-center gap-2"
              >
                ← Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !formData.titulo.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    💾 Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <style jsx global>{`
      .ProseMirror h1 {
        @apply text-2xl font-bold text-white mb-4 mt-6 first:mt-0;
      }
      .ProseMirror h2 {
        @apply text-xl font-bold text-blue-300 mb-3 mt-5;
      }
      .ProseMirror h3 {
        @apply text-lg font-bold text-green-300 mb-2 mt-4;
      }
      .ProseMirror p {
        @apply text-slate-200 leading-relaxed mb-3;
      }
      .ProseMirror ul, .ProseMirror ol {
        @apply text-slate-200 mb-3 pl-6;
      }
      .ProseMirror li {
        @apply mb-1;
      }
      .ProseMirror code {
        @apply bg-slate-700 text-yellow-300 px-2 py-1 rounded text-sm;
      }
      .ProseMirror pre {
        @apply bg-slate-700 text-green-300 p-4 rounded-lg overflow-x-auto my-4;
      }
      .ProseMirror blockquote {
        @apply border-l-4 border-blue-500 pl-4 italic text-slate-300 my-4;
      }
      .ProseMirror strong {
        @apply font-bold text-white;
      }
      .ProseMirror em {
        @apply italic text-slate-300;
      }
    `}</style>
  </div>
);

export default function EditarConteudoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const {
    loading,
    saving,
    error,
    linguagens,
    formData,
    editor,
    showEmojiPicker,
    setShowEmojiPicker,
    carregarDados,
    salvarConteudo,
    atualizarCampo,
    handleEmojiSelect,
    toolbarButtons
  } = useConteudo(resolvedParams.id);

  useEffect(() => {
    carregarDados();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await salvarConteudo();
    if (success) {
      window.location.href = "/dashboard/conteudo";
    }
  };

  if (loading) return <LoadingSpinner />;

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
      onCancel={() => window.location.href = "/dashboard/conteudo"}
      handleEmojiSelect={handleEmojiSelect}
      toolbarButtons={toolbarButtons}
    />
  );
} 