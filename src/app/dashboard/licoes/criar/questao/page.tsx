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

interface Alternativa {
  texto: string;
  correta: boolean;
}

const questaoSchema = z.object({
  conteudo_id: z.number({ required_error: 'Conteúdo de referência é obrigatório' }),
  enunciado: z.string().min(10, { message: 'Enunciado da questão deve ser mais detalhado' }),
  nivel: z.enum(['facil', 'medio', 'dificil'], { message: 'Nível da questão inválido' }),
  alternativas: z.array(z.object({
    texto: z.string().min(1, { message: 'Texto da alternativa é obrigatório' }),
    correta: z.boolean()
  })).optional(),
  codigo_teste: z.string().optional()
});

type QuestaoFormData = z.infer<typeof questaoSchema>;

interface CriarQuestaoProps {
  conteudos: Conteudo[];
  selectedLinguagem: number | null;
  onQuestaoCriada: (questaoId: number) => void;
  tipo: "pratico" | "quiz";
}

export function CriarQuestao({ conteudos, selectedLinguagem, onQuestaoCriada, tipo }: CriarQuestaoProps) {
  const [questaoForm, setQuestaoForm] = useState<QuestaoFormData>({
    conteudo_id: 0,
    enunciado: "",
    nivel: "facil",
    alternativas: tipo === "quiz" ? [
      { texto: "", correta: false },
      { texto: "", correta: false },
      { texto: "", correta: false },
      { texto: "", correta: false }
    ] : undefined,
    codigo_teste: tipo === "pratico" ? "" : undefined
  });
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleAlternativaChange = (index: number, field: keyof Alternativa, value: string | boolean) => {
    setQuestaoForm(prev => ({
      ...prev,
      alternativas: prev.alternativas?.map((alt, i) => 
        i === index ? { ...alt, [field]: value } : alt
      )
    }));
  };

  const handleQuestaoSubmit = async () => {
    try {
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
        nivel: "facil",
        alternativas: tipo === "quiz" ? [
          { texto: "", correta: false },
          { texto: "", correta: false },
          { texto: "", correta: false },
          { texto: "", correta: false }
        ] : undefined,
        codigo_teste: tipo === "pratico" ? "" : undefined
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

      {tipo === "quiz" && questaoForm.alternativas && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Alternativas
          </label>
          {questaoForm.alternativas.map((alternativa, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="radio"
                name="alternativa_correta"
                checked={alternativa.correta}
                onChange={() => handleAlternativaChange(index, "correta", true)}
                className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500"
              />
              <input
                type="text"
                value={alternativa.texto}
                onChange={(e) => handleAlternativaChange(index, "texto", e.target.value)}
                placeholder={`Alternativa ${index + 1}`}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      )}

      {tipo === "pratico" && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Código de Teste (opcional)
          </label>
          <textarea
            value={questaoForm.codigo_teste}
            onChange={(e) => setQuestaoForm(prev => ({ ...prev, codigo_teste: e.target.value }))}
            className="w-full h-32 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            placeholder="// Digite aqui o código de teste em Égua"
          />
        </div>
      )}

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