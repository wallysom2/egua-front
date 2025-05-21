"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

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
    handleEmojiSelect
  };
};

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
  handleEmojiSelect
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
}) => (
  <div className="min-h-screen bg-slate-50 p-8">
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Editar Conteúdo</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-1">
            Título
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            minLength={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="corpo" className="block text-sm font-medium text-slate-700">
              Conteúdo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
              >
                • Lista
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded ${editor?.isActive('orderedList') ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
              >
                1. Lista
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded ${editor?.isActive('codeBlock') ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
              >
                {'</>'}
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded ${editor?.isActive('blockquote') ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
              >
                "
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded hover:bg-slate-100"
              >
                😊
              </button>
            </div>
          </div>
          
          {showEmojiPicker && (
            <div className="absolute z-10">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
              />
            </div>
          )}

          <div className="border border-slate-300 rounded-lg">
            <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[300px]" />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="nivel_leitura" className="block text-sm font-medium text-slate-700 mb-1">
            Nível de Leitura
          </label>
          <select
            id="nivel_leitura"
            name="nivel_leitura"
            value={formData.nivel_leitura}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="basico">Básico</option>
            <option value="intermediario">Intermediário</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="linguagem_id" className="block text-sm font-medium text-slate-700 mb-1">
            Linguagem
          </label>
          <select
            id="linguagem_id"
            name="linguagem_id"
            value={formData.linguagem_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {linguagens.map((linguagem) => (
              <option key={linguagem.id} value={linguagem.id}>
                {linguagem.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:text-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
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
    handleEmojiSelect
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
    />
  );
} 