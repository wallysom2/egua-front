import { type Questao } from "@/types/exercicio";

interface QuestaoTextoLivreProps {
  questao: Questao;
  resposta?: string;
  onRespostaChange: (questaoId: number, resposta: string) => void;
  exercicioFinalizado: boolean;
}

export function QuestaoTextoLivre({ 
  questao, 
  resposta, 
  onRespostaChange, 
  exercicioFinalizado 
}: QuestaoTextoLivreProps) {
  return (
    <div className="space-y-4">
      <label className="block text-slate-300 mb-3 font-medium">
        ✍️ Digite sua resposta
      </label>
      
      <textarea
        value={resposta || ""}
        onChange={(e) => onRespostaChange(questao.id, e.target.value)}
        className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        placeholder="Digite sua resposta aqui..."
        disabled={exercicioFinalizado}
      />

      {questao.exemplo_resposta && (
        <div className="bg-slate-800/30 border border-slate-600 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            💡 Exemplo de Resposta
          </h4>
          <div className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded">
            {questao.exemplo_resposta}
          </div>
        </div>
      )}
    </div>
  );
} 