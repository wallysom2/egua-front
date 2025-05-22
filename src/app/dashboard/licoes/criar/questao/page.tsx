"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

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
  id: string;
  texto: string;
  correta: boolean;
}

// Schema para o estado interno do formulário, inclui 'correta' nas opções
const questaoFormSchema = z.object({
  conteudo_id: z.number(),
  enunciado: z.string().min(10, { message: 'Enunciado da questão deve ser mais detalhado' }),
  nivel: z.enum(['facil', 'medio', 'dificil'], { message: 'Nível da questão inválido' }),
  tipo: z.enum(['quiz', 'programacao'], { message: 'Tipo de questão inválido' }),
  opcoes: z.array(z.object({
    id: z.string(),
    texto: z.string().min(1, { message: 'Texto da alternativa é obrigatório' }),
    correta: z.boolean()
  })).optional(),
  resposta_correta: z.string().optional(), // Usado internamente para rastrear o ID da correta
  exemplo_resposta: z.string().optional()
}).refine((data) => {
  if (data.tipo === 'quiz') {
    if (!data.opcoes || data.opcoes.length < 2 || data.opcoes.length > 5) return false;
    if (!data.opcoes.some(op => op.correta)) return false;
    if (!data.opcoes.every(op => op.texto.trim() !== '')) return false;
    return true;
  }
  if (data.tipo === 'programacao') {
    return data.exemplo_resposta !== undefined && data.exemplo_resposta.trim() !== '';
  }
  return true;
}, { message: 'Dados inválidos para o tipo de questão especificado (validação de formulário)' });

type QuestaoFormData = z.infer<typeof questaoFormSchema>;

// Schemas para validar os dados a serem enviados para a API
const baseApiQuestaoProps = {
    conteudo_id: z.number({ required_error: 'Conteúdo de referência é obrigatório' }).min(1, "Conteúdo de referência é obrigatório"),
    enunciado: z.string().min(10, { message: 'Enunciado da questão deve ser mais detalhado' }),
    nivel: z.enum(['facil', 'medio', 'dificil'], { message: 'Nível da questão inválido' }),
};

const quizApiQuestaoUnrefinedSchema = z.object({
    ...baseApiQuestaoProps,
    tipo: z.literal('quiz'),
    opcoes: z.array(z.object({
        id: z.string(),
        texto: z.string().trim().min(1, { message: 'Texto da alternativa é obrigatório' }),
    })).min(2, "A questão deve ter pelo menos 2 alternativas").max(5, "A questão deve ter no máximo 5 alternativas"),
    resposta_correta: z.string({required_error: "Uma resposta correta é obrigatória para quiz"}).min(1, "Uma resposta correta é obrigatória para quiz"),
    exemplo_resposta: z.undefined().optional(),
});

// Schema refinado para quiz, usado após a validação da união discriminada
const quizApiQuestaoRefinedSchema = quizApiQuestaoUnrefinedSchema.refine(
    data => data.opcoes.some(op => op.id === data.resposta_correta),
    {
        message: "A resposta correta deve ser uma das opções fornecidas.",
        path: ["resposta_correta"],
    }
);

const programacaoApiQuestaoSchema = z.object({
    ...baseApiQuestaoProps,
    tipo: z.literal('programacao'),
    exemplo_resposta: z.string().trim().min(1, { message: "Exemplo de resposta é obrigatório" }),
    opcoes: z.undefined().optional(),
    resposta_correta: z.undefined().optional(),
});

const apiQuestaoValidator = z.discriminatedUnion("tipo", [
    quizApiQuestaoUnrefinedSchema, // Usamos o schema não refinado aqui
    programacaoApiQuestaoSchema
]);

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
    tipo: tipo === "quiz" ? "quiz" : "programacao",
    opcoes: tipo === "quiz" ? [
      { id: uuidv4(), texto: "", correta: false },
      { id: uuidv4(), texto: "", correta: false },
      { id: uuidv4(), texto: "", correta: false },
      { id: uuidv4(), texto: "", correta: false }
    ] : undefined,
    exemplo_resposta: tipo === "pratico" ? "" : undefined
  });

  // Atualiza o tipo da questão quando o tipo do exercício muda
  useEffect(() => {
    setQuestaoForm(prev => ({
      ...prev,
      tipo: tipo === "quiz" ? "quiz" : "programacao",
      opcoes: tipo === "quiz" ? [
        { id: uuidv4(), texto: "", correta: false },
        { id: uuidv4(), texto: "", correta: false },
        { id: uuidv4(), texto: "", correta: false },
        { id: uuidv4(), texto: "", correta: false }
      ] : undefined,
      exemplo_resposta: tipo === "pratico" ? "" : undefined
    }));
  }, [tipo]);

  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleAlternativaChange = (index: number, field: keyof Alternativa, value: string | boolean) => {
    setQuestaoForm(prev => {
      const newOpcoes = prev.opcoes?.map((alt, i) => {
        if (i === index) {
          return { ...alt, [field]: value };
        }
        // Se estiver marcando uma alternativa como correta, desmarca as outras
        if (field === "correta" && value === true) {
          return { ...alt, correta: false };
        }
        return alt;
      });

      // Se for marcando como correta, atualiza a resposta_correta
      let resposta_correta = prev.resposta_correta;
      if (field === "correta" && value === true) {
        resposta_correta = newOpcoes?.[index].id || "";
      }

      return {
        ...prev,
        opcoes: newOpcoes,
        resposta_correta
      };
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (questaoForm.tipo === "quiz") {
      if (!questaoForm.opcoes || questaoForm.opcoes.length < 2) {
        errors.opcoes = "A questão deve ter pelo menos 2 alternativas";
      } else if (questaoForm.opcoes.length > 5) {
        errors.opcoes = "A questão deve ter no máximo 5 alternativas";
      } else if (!questaoForm.opcoes.some(opt => opt.correta)) {
        errors.opcoes = "Selecione uma alternativa correta";
      } else if (questaoForm.opcoes.some(opt => !opt.texto.trim())) {
        errors.opcoes = "Preencha todas as alternativas";
      }
    } else if (questaoForm.tipo === "programacao") {
      if (!questaoForm.exemplo_resposta || !questaoForm.exemplo_resposta.trim()) {
        errors.exemplo_resposta = "O exemplo de resposta é obrigatório";
      }
    }

    return errors;
  };

  const handleQuestaoSubmit = async () => {
    try {
      setError(null);
      setValidationErrors({});

      // Validação manual para feedback de UI imediato
      const formErrors = validateForm();
      if (Object.keys(formErrors).length > 0) {
        setValidationErrors(formErrors);
        throw new Error("Dados inválidos no formulário");
      }

      // Prepara os dados para envio no formato da API
      let dadosParaEnvio: any = {
        conteudo_id: questaoForm.conteudo_id,
        enunciado: questaoForm.enunciado.trim(),
        nivel: questaoForm.nivel,
        tipo: questaoForm.tipo,
      };

      if (questaoForm.tipo === "quiz") {
        dadosParaEnvio.opcoes = questaoForm.opcoes?.map(op => ({
          id: op.id,
          texto: op.texto.trim()
        }));
        dadosParaEnvio.resposta_correta = questaoForm.opcoes?.find(op => op.correta)?.id;
        if (!dadosParaEnvio.resposta_correta) {
           throw new Error("Resposta correta não selecionada para o quiz."); 
        }
      } else {
        dadosParaEnvio.exemplo_resposta = questaoForm.exemplo_resposta?.trim();
      }

      // Validação com Zod usando o schema da API (união discriminada)
      let validatedData = apiQuestaoValidator.parse(dadosParaEnvio);

      // Validação adicional específica para quiz usando o schema refinado
      if (validatedData.tipo === 'quiz') {
        validatedData = quizApiQuestaoRefinedSchema.parse(validatedData);
      }

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
        tipo: tipo === "quiz" ? "quiz" : "programacao",
        opcoes: tipo === "quiz" ? [
          { id: uuidv4(), texto: "", correta: false },
          { id: uuidv4(), texto: "", correta: false },
          { id: uuidv4(), texto: "", correta: false },
          { id: uuidv4(), texto: "", correta: false }
        ] : undefined,
        exemplo_resposta: tipo === "pratico" ? "" : undefined
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            const path = err.path.join('.');
            errors[path] = err.message;
            // Para erros de união discriminada, o path pode ser vazio ou referir-se ao campo discriminador
            if (err.path.length === 0 && err.message.includes("Invalid discriminator value")) {
              errors["tipo"] = "Tipo de questão inválido ou dados inconsistentes para o tipo.";
            }
          }
        });
        setValidationErrors(errors);
        console.error("Erro de validação Zod (API):", error.errors);
      } else {
        console.error("Erro ao criar questão:", error);
        setError(error instanceof Error && error.message !== "Dados inválidos no formulário" ? error.message : "Erro ao criar questão. Tente novamente.");
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

      {questaoForm.tipo === "quiz" && questaoForm.opcoes && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Alternativas
          </label>
          {validationErrors.opcoes && (
            <p className="text-sm text-red-400">{validationErrors.opcoes}</p>
          )}
          {questaoForm.opcoes.map((alternativa, index) => (
            <div key={alternativa.id} className="flex items-center space-x-4">
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

      {questaoForm.tipo === "programacao" && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Exemplo de Resposta
          </label>
          <textarea
            value={questaoForm.exemplo_resposta}
            onChange={(e) => setQuestaoForm(prev => ({ ...prev, exemplo_resposta: e.target.value }))}
            className={`w-full h-32 px-4 py-2 bg-slate-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
              validationErrors.exemplo_resposta ? 'border-red-500' : 'border-slate-700'
            }`}
            placeholder="// Digite aqui um exemplo de resposta em Égua"
          />
          {validationErrors.exemplo_resposta && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.exemplo_resposta}</p>
          )}
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