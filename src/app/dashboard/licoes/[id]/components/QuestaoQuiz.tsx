import { type Questao } from "@/types/exercicio";
import { motion } from "framer-motion";

interface QuestaoQuizProps {
  questao: Questao;
  respostaSelecionada?: string;
  onRespostaChange: (questaoId: number, resposta: string) => void;
  exercicioFinalizado: boolean;
  mostrarResultado?: boolean;
}

export function QuestaoQuiz({
  questao,
  respostaSelecionada,
  onRespostaChange,
  exercicioFinalizado,
  mostrarResultado = false
}: QuestaoQuizProps) {
  if (!questao.opcoes || questao.opcoes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400">
          <div className="text-4xl mb-4">❓</div>
          <p>Esta questão não possui opções de resposta.</p>
        </div>
      </div>
    );
  }

  const obterEstiloOpcao = (opcao: any) => {
    const estaSelecionada = respostaSelecionada === opcao.id;

    if (!mostrarResultado) {
      // Modo normal (antes de finalizar)
      return estaSelecionada
        ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-900 dark:text-blue-100 shadow-lg"
        : "bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600";
    }

    // Modo resultado (após finalizar)
    const estaCorreta = questao.resposta_correta === opcao.id;

    if (estaCorreta) {
      // Resposta correta - sempre verde
      return "bg-green-100 dark:bg-green-900/40 border-green-500 text-green-900 dark:text-green-100 shadow-green-500/20 shadow-lg";
    } else if (estaSelecionada) {
      // Resposta selecionada mas incorreta - vermelho
      return "bg-red-100 dark:bg-red-900/40 border-red-500 text-red-900 dark:text-red-100 shadow-red-500/20 shadow-lg";
    } else {
      // Outras opções - neutro
      return "bg-slate-100 dark:bg-slate-800/30 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400";
    }
  };

  const obterIconeOpcao = (opcao: any) => {
    const estaSelecionada = respostaSelecionada === opcao.id;
    const estaCorreta = questao.resposta_correta === opcao.id;

    if (!mostrarResultado) {
      return null;
    }

    if (estaCorreta) {
      return (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-green-400 font-bold text-lg"
        >
          ✓
        </motion.span>
      );
    } else if (estaSelecionada) {
      return (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-red-400 font-bold text-lg"
        >
          ✗
        </motion.span>
      );
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {questao.opcoes?.map((opcao, index) => (
        <motion.label
          key={opcao.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={!exercicioFinalizado ? { scale: 1.02 } : {}}
          className={`flex items-center p-4 border rounded-lg transition-all duration-300 ${obterEstiloOpcao(opcao)} ${exercicioFinalizado ? "cursor-not-allowed" : "cursor-pointer"
            }`}
        >
          <div className="flex items-center">
            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${respostaSelecionada === opcao.id
                ? "border-blue-500 bg-blue-500"
                : "border-slate-400 dark:border-slate-500"
              }`}>
              {respostaSelecionada === opcao.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              )}
            </div>
            <span className="font-medium mr-3 text-slate-500 dark:text-slate-400">
              {String.fromCharCode(65 + index)}.
            </span>
          </div>
          <span className="flex-1">{opcao.texto}</span>
          <div className="ml-2">
            {obterIconeOpcao(opcao)}
          </div>
          <input
            type="radio"
            name={`questao-${questao.id}`}
            value={opcao.id}
            checked={respostaSelecionada === opcao.id}
            onChange={(e) => onRespostaChange(questao.id, e.target.value)}
            disabled={exercicioFinalizado}
            className="sr-only"
          />
        </motion.label>
      ))}
    </div>
  );
}