"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CriarQuestao } from "@/components/CriarQuestao";

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

export default function CriarQuestaoPage() {
  const router = useRouter();
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLinguagem, setSelectedLinguagem] = useState<number | null>(null);
  const [tipoQuestao, setTipoQuestao] = useState<"pratico" | "quiz">("pratico");

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleQuestaoCriada = (_questaoId: number) => {
    // Redireciona para a página de lições após criar a questão
    router.push("/dashboard/licoes");
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
        <h1 className="text-3xl font-bold text-blue-400 mb-8">Criar Nova Questão</h1>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Linguagem
            </label>
            <select
              value={selectedLinguagem || ""}
              onChange={(e) => setSelectedLinguagem(Number(e.target.value) || null)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as linguagens</option>
              {linguagens.map((linguagem) => (
                <option key={linguagem.id} value={linguagem.id}>
                  {linguagem.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Questão
            </label>
            <select
              value={tipoQuestao}
              onChange={(e) => setTipoQuestao(e.target.value as "pratico" | "quiz")}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pratico">Prático (Programação)</option>
              <option value="quiz">Quiz (Múltipla Escolha)</option>
            </select>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <CriarQuestao
              conteudos={conteudos}
              selectedLinguagem={selectedLinguagem}
              onQuestaoCriada={handleQuestaoCriada}
              tipo={tipoQuestao}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/licoes")}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 