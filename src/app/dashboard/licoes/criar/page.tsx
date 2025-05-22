"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { CriarQuestao } from "@/app/components/CriarQuestao";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Linguagem {
  id: number;
  nome: string;
}

interface Conteudo {
  id: number;
  titulo: string;
  linguagem_id: number;
}

const exercicioSchema = z.object({
  titulo: z.string().min(3, { message: "Título do exercício deve ter pelo menos 3 caracteres" }),
  tipo: z.enum(["pratico", "quiz"], { message: "Tipo de exercício inválido" }),
  linguagem_id: z.number({ required_error: "Linguagem do exercício é obrigatória" }),
  questoes: z.array(z.object({
    questao_id: z.number(),
    ordem: z.number().optional().default(0)
  })).min(1, { message: "Exercício deve ter pelo menos uma questão" })
});

export default function CriarExercicio() {
  const router = useRouter();
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLinguagem, setSelectedLinguagem] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "pratico" as "pratico" | "quiz",
    linguagem_id: 0,
    questoes: [] as { questao_id: number; ordem: number }[]
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [linguagensResponse, conteudosResponse] = await Promise.allSettled([
          fetch(`${API_URL}/linguagens`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/conteudos`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ]);

        if (linguagensResponse.status === "fulfilled" && linguagensResponse.value.ok) {
          const data = await linguagensResponse.value.json();
          setLinguagens(data);
        }

        if (conteudosResponse.status === "fulfilled" && conteudosResponse.value.ok) {
          const data = await conteudosResponse.value.json();
          setConteudos(data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Não foi possível carregar os dados necessários.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLinguagemChange = (linguagemId: number) => {
    setSelectedLinguagem(linguagemId);
    setFormData(prev => ({ ...prev, linguagem_id: linguagemId }));
  };

  const handleQuestaoCriada = (questaoId: number) => {
    setFormData(prev => ({
      ...prev,
      questoes: [...prev.questoes, { questao_id: questaoId, ordem: prev.questoes.length }]
    }));
  };

  const handleExercicioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/exercicios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard/licoes");
      }
    } catch (error) {
      console.error("Erro ao criar exercício:", error);
      setError("Erro ao criar exercício. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-8">Criar Novo Exercício</h1>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleExercicioSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Título do Exercício
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo de Exercício
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as "pratico" | "quiz" }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pratico">Prático</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Linguagem
              </label>
              <select
                value={formData.linguagem_id}
                onChange={(e) => handleLinguagemChange(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione uma linguagem</option>
                {linguagens.map((linguagem) => (
                  <option key={linguagem.id} value={linguagem.id}>
                    {linguagem.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Adicionar Questões</h2>
            
            <CriarQuestao
              conteudos={conteudos}
              selectedLinguagem={selectedLinguagem}
              onQuestaoCriada={handleQuestaoCriada}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-300">Questões Adicionadas</h3>
              {formData.questoes.length === 0 ? (
                <p className="text-slate-400">Nenhuma questão adicionada ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {formData.questoes.map((questao, index) => (
                    <li
                      key={questao.questao_id}
                      className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
                    >
                      <span className="text-slate-300">Questão {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          questoes: prev.questoes.filter(q => q.questao_id !== questao.questao_id)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/licoes")}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formData.questoes.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Exercício
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 