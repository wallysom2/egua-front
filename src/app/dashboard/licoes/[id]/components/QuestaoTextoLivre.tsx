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
    </div>
  );
} 