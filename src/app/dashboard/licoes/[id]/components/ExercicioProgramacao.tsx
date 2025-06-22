import { useState } from 'react';
import { EguaCompiler } from '@/components/EguaCompiler';
import { AnaliseGemini } from './AnaliseGemini';
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
      {/* Editor de Código Simplificado */}
      <div className="space-y-4">
        <EguaCompiler
          codigoInicial={codigoAtual}
          altura="h-80"
          disabled={exercicioFinalizado}
          mostrarTempo={false}
          atalhoTeclado={true}
          onCodigoChange={handleCodigoChange}
        />

        {/* Botão Submeter - Simplificado */}
        {questao && userId && exercicioId && !exercicioFinalizado && (
          <button
            onClick={submeterResposta}
            disabled={submissaoCarregando || !codigoAtual.trim()}
            className={`w-full py-4 text-lg font-semibold rounded-lg transition-all ${
              submissaoSucesso
                ? 'bg-green-500 text-white'
                : submissaoCarregando
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {submissaoCarregando
              ? 'Enviando...'
              : submissaoSucesso
              ? '✅ Enviado com sucesso!'
              : 'Enviar Resposta'}
          </button>
        )}

        {/* Mensagem de Erro Simplificada */}
        {submissaoError && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-4">
            <p className="text-red-700 text-center font-medium">
              ❌ {submissaoError}
            </p>
          </div>
        )}

        {/* Exemplo de Resposta - Simplificado */}
        {questao?.exemplo_resposta && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3">
              💡 Exemplo de como fazer:
            </h4>
            <div className="bg-white p-4 rounded border">
              <pre className="text-sm text-gray-800 font-mono">
                {questao.exemplo_resposta}
              </pre>
            </div>
          </div>
        )}

        {/* Status Final Simplificado */}
        {exercicioFinalizado && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
            <p className="text-green-700 text-lg font-semibold">
              ✅ Exercício concluído!
            </p>
          </div>
        )}
      </div>

      {/* Análise do Gemini - Mantida mas simplificada */}
      <div className="mt-8">
        <AnaliseGemini
          respostaId={respostaId}
          questaoId={questao?.id || 0}
          userId={userId || ''}
        />
      </div>
    </div>
  );
}
