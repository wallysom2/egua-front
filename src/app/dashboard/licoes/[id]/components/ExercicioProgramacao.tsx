import { EguaCompiler } from "@/components/EguaCompiler";
import { type Questao } from "@/types/exercicio";

interface ExercicioProgramacaoProps {
  questao?: Questao;
  codigoExemplo?: string;
  exercicioFinalizado: boolean;
}

export function ExercicioProgramacao({ 
  questao, 
  codigoExemplo, 
  exercicioFinalizado 
}: ExercicioProgramacaoProps) {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna da Esquerda - Editor de Código */}
      <div className="space-y-4">
        <EguaCompiler
          codigoInicial={codigoExemplo || questao?.exemplo_resposta || 'escreva("Olá, Mundo!");'}
          altura="h-64 lg:h-80"
          disabled={exercicioFinalizado}
          mostrarTempo={true}
          atalhoTeclado={true}
        />
      </div>

      {/* Coluna da Direita - Feedback */}
      <div className="space-y-4">
        {/* Dica - Exemplo de Resposta */}
        {questao?.exemplo_resposta && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-amber-200 dark:border-amber-700 bg-amber-100/50 dark:bg-amber-900/30">
              <h4 className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 text-sm">
                💡 Dica - Exemplo de Resposta
              </h4>
            </div>
            <div className="p-4">
              <pre className="text-amber-800 dark:text-amber-300 font-mono text-sm overflow-x-auto max-h-40 overflow-y-auto leading-relaxed">
                {questao.exemplo_resposta}
              </pre>
            </div>
          </div>
        )}

        {/* Instruções Adicionais */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-slate-700 dark:text-slate-300 font-medium mb-3 flex items-center gap-2 text-sm">
            📚 Instruções
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <p>• Use <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">escreva()</code> para exibir texto</p>
            <p>• Use <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">variavel nome = valor</code> para criar variáveis</p>
            <p>• Use <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">se</code> e <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">senao</code> para condicionais</p>
            <p>• Use <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">para</code> e <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">enquanto</code> para loops</p>
          </div>
        </div>

        {/* Status do Exercício */}
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
          <span>
            {exercicioFinalizado ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                ✅ Exercício finalizado
              </span>
            ) : (
              <span className="flex items-center gap-1">
                ✏️ Exercício em andamento
              </span>
            )}
          </span>
          <span>
            Linguagem: Égua
          </span>
        </div>
      </div>
    </div>
  );
} 