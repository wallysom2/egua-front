import { useState } from 'react';
import { EguaCompiler } from '@/components/EguaCompiler';
import { AnaliseGemini } from './AnaliseGemini';
import { DebugAnalise } from './DebugAnalise';
import { type Questao } from '@/types/exercicio';

interface ExercicioProgramacaoProps {
  questao?: Questao;
  codigoExemplo?: string;
  exercicioFinalizado: boolean;
  userId?: string | number;
  exercicioId?: string | number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function ExercicioProgramacao({
  questao,
  codigoExemplo,
  exercicioFinalizado,
  userId,
  exercicioId,
}: ExercicioProgramacaoProps) {
  const [codigoAtual, setCodigoAtual] = useState(
    codigoExemplo || questao?.exemplo_resposta || 'escreva("Olá, Mundo!");',
  );
  const [respostaId, setRespostaId] = useState<string | null>(null);
  const [progressoId, setProgressoId] = useState<string | null>(null);
  const [submissaoCarregando, setSubmissaoCarregando] = useState(false);
  const [submissaoError, setSubmissaoError] = useState<string | null>(null);
  const [submissaoSucesso, setSubmissaoSucesso] = useState(false);

  const obterOuCriarProgresso = async (): Promise<string | null> => {
    if (progressoId) return progressoId;

    try {
      const token = localStorage.getItem('token');

      // Primeiro, tentar criar/obter o progresso do exercício
      const progressoResponse = await fetch(`${API_URL}/user-exercicio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exercicio_id: parseInt(exercicioId?.toString() || '0'),
        }),
      });

      if (progressoResponse.ok) {
        const progresso = await progressoResponse.json();
        const novoProgressoId = progresso.id;
        setProgressoId(novoProgressoId);
        return novoProgressoId;
      } else {
        const errorData = await progressoResponse.json();
        throw new Error(
          errorData.message || 'Erro ao criar progresso do exercício',
        );
      }
    } catch (error) {
      console.error('Erro ao obter/criar progresso:', error);
      throw error;
    }
  };

  const submeterResposta = async () => {
    if (!questao || !userId || !exercicioId || !codigoAtual.trim()) {
      setSubmissaoError('Dados insuficientes para submissão');
      return;
    }

    setSubmissaoCarregando(true);
    setSubmissaoError(null);

    try {
      const token = localStorage.getItem('token');

      // Primeiro, garantir que temos o progresso do exercício
      const userExercicioId = await obterOuCriarProgresso();
      if (!userExercicioId) {
        throw new Error('Não foi possível criar progresso do exercício');
      }

      // Agora submeter a resposta
      const response = await fetch(`${API_URL}/user-resposta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_exercicio_id: userExercicioId,
          questao_id: questao.id,
          resposta: codigoAtual.trim(),
        }),
      });

      if (response.ok) {
        const resultado = await response.json();
        setRespostaId(resultado.id);
        setSubmissaoSucesso(true);

        // Mostrar mensagem de sucesso por 3 segundos
        setTimeout(() => setSubmissaoSucesso(false), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao submeter resposta');
      }
    } catch (error) {
      console.error('Erro ao submeter resposta:', error);
      setSubmissaoError(
        error instanceof Error ? error.message : 'Erro ao submeter resposta',
      );
    } finally {
      setSubmissaoCarregando(false);
    }
  };

  const handleCodigoChange = (novoCodigo: string) => {
    setCodigoAtual(novoCodigo);
    // Reset do status de submissão quando o código muda
    if (submissaoSucesso) {
      setSubmissaoSucesso(false);
    }
    if (submissaoError) {
      setSubmissaoError(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor de Código */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna da Esquerda - Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              💻 Editor de Código
            </h3>
            {questao && userId && exercicioId && !exercicioFinalizado && (
              <button
                onClick={submeterResposta}
                disabled={submissaoCarregando || !codigoAtual.trim()}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  submissaoSucesso
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : submissaoCarregando
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {submissaoCarregando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : submissaoSucesso ? (
                  <>✅ Enviado!</>
                ) : (
                  <>🚀 Submeter Resposta</>
                )}
              </button>
            )}
          </div>

          <EguaCompiler
            codigoInicial={codigoAtual}
            altura="h-64 lg:h-80"
            disabled={exercicioFinalizado}
            mostrarTempo={true}
            atalhoTeclado={true}
            onCodigoChange={handleCodigoChange}
          />

          {/* Status da Submissão */}
          {submissaoError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <span>❌</span>
                <span className="text-sm">{submissaoError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Coluna da Direita - Instruções e Análise */}
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
              <p>
                • Use{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  escreva()
                </code>{' '}
                para exibir texto
              </p>
              <p>
                • Use{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  variavel nome = valor
                </code>{' '}
                para criar variáveis
              </p>
              <p>
                • Use{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  se
                </code>{' '}
                e{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  senao
                </code>{' '}
                para condicionais
              </p>
              <p>
                • Use{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  para
                </code>{' '}
                e{' '}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  enquanto
                </code>{' '}
                para loops
              </p>
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
            <span>Linguagem: Senior Code AI</span>
          </div>
        </div>
      </div>

      {/* Análise do Gemini */}
      <div className="mt-6">
        <AnaliseGemini
          respostaId={respostaId}
          questaoId={questao?.id || 0}
          userId={userId || ''}
        />
      </div>

      {/* Debug em desenvolvimento */}
      <DebugAnalise
        respostaId={respostaId}
        progressoId={progressoId}
        userId={userId}
        exercicioId={exercicioId}
      />
    </div>
  );
}
