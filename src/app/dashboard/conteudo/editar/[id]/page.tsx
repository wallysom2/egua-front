"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

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

export default function EditarConteudoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [formData, setFormData] = useState<Conteudo>({
    id: 0,
    titulo: "",
    corpo: "",
    nivel_leitura: "basico",
    linguagem_id: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Buscar linguagens
        const linguagensResponse = await fetch("http://localhost:5000/linguagens", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!linguagensResponse.ok) {
          throw new Error("Erro ao carregar linguagens");
        }

        const linguagensData = await linguagensResponse.json();
        setLinguagens(linguagensData);

        // Buscar conteúdo
        const conteudoResponse = await fetch(`http://localhost:5000/conteudos/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!conteudoResponse.ok) {
          throw new Error("Erro ao carregar conteúdo");
        }

        const conteudoData = await conteudoResponse.json();
        setFormData(conteudoData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`http://localhost:5000/conteudos/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar conteúdo");
      }

      router.push("/dashboard/conteudo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar conteúdo");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "linguagem_id" ? Number(value) : value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
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
            <label htmlFor="corpo" className="block text-sm font-medium text-slate-700 mb-1">
              Conteúdo
            </label>
            <textarea
              id="corpo"
              name="corpo"
              value={formData.corpo}
              onChange={handleChange}
              required
              minLength={10}
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              onClick={() => router.back()}
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
} 