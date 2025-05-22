"use client";

import { useState } from "react";
import { z } from "zod";

interface Linguagem {
  id: number;
  nome: string;
}

interface Conteudo {
  id: number;
  titulo: string;
  linguagem_id: number;
}

const questaoSchema = z.object({
  conteudo_id: z.number({ required_error: 'Conteúdo de referência é obrigatório' }),
  enunciado: z.string().min(10, { message: 'Enunciado da questão deve ser mais detalhado' }),
  nivel: z.enum(['facil', 'medio', 'dificil'], { message: 'Nível da questão inválido' })
});

type QuestaoFormData = z.infer<typeof questaoSchema>;

interface CriarQuestaoProps {
  conteudos: Conteudo[];
  selectedLinguagem: number | null;
  onQuestaoCriada: (questaoId: number) => void;
}

export function CriarQuestao({ conteudos, selectedLinguagem, onQuestaoCriada }: CriarQuestaoProps) {
  const [questaoForm, setQuestaoForm] = useState<QuestaoFormData>({
    conteudo_id: 0,
    enunciado: "",
    nivel: "facil"
  });
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleQuestaoSubmit = async () => {
    try {
      // Validar os dados antes de enviar
      const validatedData = questaoSchema.parse(questaoForm);
      setValidationErrors({});

      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${API_URL}/questoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar questão');
      }

      const novaQuestao = await response.json();
      onQuestaoCriada(novaQuestao.id);
      setQuestaoForm({
        conteudo_id: 0,
        enunciado: "",
        nivel: "facil"
      });
      setError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(errors);
      } else {
        console.error("Erro ao criar questão:", error);
        setError(error instanceof Error ? error.message : "Erro ao criar questão. Tente novamente.");
      }
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {error && (
        <div className="bg-red-900/50 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Conteúdo de Referência
        </label>
        <select
          value={questaoForm.conteudo_id}
          onChange={(e) => setQuestaoForm(prev => ({ ...prev, conteudo_id: Number(e.target.value) }))}
          className={`w-full px-4 py-2 bg-slate-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors.conteudo_id ? 'border-red-500' : 'border-slate-700'
          }`}
          required
        >
          <option value="">Selecione um conteúdo</option>
          {conteudos
            .filter(conteudo => !selectedLinguagem || conteudo.linguagem_id === selectedLinguagem)
            .map((conteudo) => (
              <option key={conteudo.id} value={conteudo.id}>
                {conteudo.titulo}
              </option>
            ))}
        </select>
        {validationErrors.conteudo_id && (
          <p className="mt-1 text-sm text-red-400">{validationErrors.conteudo_id}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Enunciado da Questão
        </label>
        <textarea
          value={questaoForm.enunciado}
          onChange={(e) => setQuestaoForm(prev => ({ ...prev, enunciado: e.target.value }))}
          className={`w-full px-4 py-2 bg-slate-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors.enunciado ? 'border-red-500' : 'border-slate-700'
          }`}
          rows={4}
          required
        />
        {validationErrors.enunciado && (
          <p className="mt-1 text-sm text-red-400">{validationErrors.enunciado}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nível da Questão
        </label>
        <select
          value={questaoForm.nivel}
          onChange={(e) => setQuestaoForm(prev => ({ ...prev, nivel: e.target.value as "facil" | "medio" | "dificil" }))}
          className={`w-full px-4 py-2 bg-slate-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors.nivel ? 'border-red-500' : 'border-slate-700'
          }`}
        >
          <option value="facil">Fácil</option>
          <option value="medio">Médio</option>
          <option value="dificil">Difícil</option>
        </select>
        {validationErrors.nivel && (
          <p className="mt-1 text-sm text-red-400">{validationErrors.nivel}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleQuestaoSubmit}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Adicionar Questão
      </button>
    </div>
  );
} 