import { useState } from 'react';
import { EguaCompiler } from '@/components/EguaCompiler';
import { AnaliseGemini } from './AnaliseGemini';
import { type Questao, type StatusExercicio, type IniciarExercicioResponse } from '@/types/exercicio';

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
  const [iniciandoExercicio, setIniciandoExercicio] = useState(false);

  const obterOuCriarProgresso = async (): Promise<string> => {
    if (progressoId) return progressoId;

    try {
      const token = localStorage.getItem('token');

      // Primeiro, verificar se já existe progresso para este exercício
      const statusResponse = await fetch(
        `${API_URL}/progresso-exercicios/status/${exercicioId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('🔍 DEBUG - Status do exercício:', statusData);

        if (statusData.status === 'em_andamento' && statusData.progresso) {
          // Exercício já iniciado
          const existingProgressoId = statusData.progresso.id;
          console.log('🔍 DEBUG - Progresso existente:', existingProgressoId);
          setProgressoId(existingProgressoId);
          return existingProgressoId;
        }
      }

      // Se não há progresso ou erro na verificação, iniciar o exercício
      console.log('🔍 DEBUG - Iniciando exercício...');
      setIniciandoExercicio(true);
      
      const iniciarResponse = await fetch(
        `${API_URL}/progresso-exercicios/iniciar/${exercicioId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (iniciarResponse.ok) {
        const iniciarData = await iniciarResponse.json();
        console.log('🔍 DEBUG - Exercício iniciado:', iniciarData);
        
        const novoProgressoId = iniciarData.data.id;
        setProgressoId(novoProgressoId);
        return novoProgressoId;
      } else {
        const errorData = await iniciarResponse.json();
        throw new Error(
          errorData.message || 'Erro ao iniciar exercício',
        );
      }
    } catch (error) {
      console.error('Erro ao obter/criar progresso:', error);
      throw error;
    } finally {
      setIniciandoExercicio(false);
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

      // Primeiro, garantir que temos o progresso do exercício (obrigatório)
      const userExercicioId = await obterOuCriarProgresso();
      if (!userExercicioId) {
        throw new Error('Não foi possível obter ID do progresso do exercício');
      }

      // Logs detalhados para debug
      console.log('🔍 DEBUG - userExercicioId raw:', userExercicioId);
      console.log('🔍 DEBUG - questao:', questao);
      console.log('🔍 DEBUG - codigoAtual:', codigoAtual);
      console.log('🔍 DEBUG - userId:', userId);
      console.log('🔍 DEBUG - exercicioId:', exercicioId);

      // Preparar dados no formato correto do backend (todos os campos obrigatórios)
      const dadosResposta = {
        user_exercicio_id: userExercicioId, // Sempre obrigatório
        questao_id: questao.id,
        resposta: codigoAtual.trim(),
      };

      // Log para debug
      console.log('🔍 Dados da resposta para envio:', dadosResposta);
      console.log('🔍 Tipos dos dados:', {
        user_exercicio_id: typeof dadosResposta.user_exercicio_id,
        questao_id: typeof dadosResposta.questao_id,
        resposta: typeof dadosResposta.resposta,
      });

      // Validar todos os campos obrigatórios
      if (!dadosResposta.user_exercicio_id || dadosResposta.user_exercicio_id.trim() === '') {
        throw new Error('ID do progresso do exercício é obrigatório');
      }
      if (!dadosResposta.questao_id || dadosResposta.questao_id <= 0) {
        throw new Error('ID da questão é inválido');
      }
      if (!dadosResposta.resposta || dadosResposta.resposta.trim() === '') {
        throw new Error('Resposta não pode estar vazia');
      }

      // Serializar dados
      let bodyString;
      try {
        bodyString = JSON.stringify(dadosResposta);
        console.log('🔍 DEBUG - Body serializado:', bodyString);
      } catch (serializationError) {
        console.error('❌ Erro na serialização JSON:', serializationError);
        throw new Error('Erro ao preparar dados para envio');
      }

      // Submeter resposta usando o endpoint correto
      const response = await fetch(`${API_URL}/respostas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: bodyString,
      });

      if (response.ok) {
        const resultado = await response.json();
        console.log('✅ Resposta submetida com sucesso:', resultado);
        
        setRespostaId(resultado.id);
        setSubmissaoSucesso(true);

        // Se o backend retornou um progresso, salvar o ID
        if (resultado.user_exercicio_id && !progressoId) {
          setProgressoId(resultado.user_exercicio_id);
        }

        // Mostrar mensagem de sucesso por 3 segundos
        setTimeout(() => setSubmissaoSucesso(false), 3000);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro do servidor:', errorData);
        console.error('❌ Status da resposta:', response.status);
        console.error('❌ Dados que foram enviados:', dadosResposta);
        
        // Tratamento específico para erros de validação
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errosDetalhados = errorData.errors.map((err: any) => 
            `${err.path?.join?.('.') || 'Campo'}: ${err.message} (recebido: ${err.received}, esperado: ${err.expected})`
          ).join(', ');
          throw new Error(`Dados inválidos: ${errosDetalhados}`);
        }
        
        throw new Error(errorData.message || 'Erro ao submeter resposta');
      }
    } catch (error) {
      console.error('❌ Erro ao submeter resposta:', error);
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

        {/* Botão Enviar Resposta - Melhorado */}
        {questao && userId && exercicioId && !exercicioFinalizado && (
          <div className="flex justify-end">
            <button
              onClick={submeterResposta}
              disabled={submissaoCarregando || iniciandoExercicio || !codigoAtual.trim()}
              className={`group relative px-8 py-3 font-semibold text-white rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg ${
                submissaoSucesso
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-green-500/25'
                  : submissaoCarregando || iniciandoExercicio
                  ? 'bg-slate-400 cursor-not-allowed shadow-slate-400/25'
                  : !codigoAtual.trim()
                  ? 'bg-slate-400 cursor-not-allowed shadow-slate-400/25'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-500/25 hover:shadow-blue-500/40'
              }`}
            >
              <div className="flex items-center space-x-2">
                {iniciandoExercicio ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando...</span>
                  </>
                ) : submissaoCarregando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : submissaoSucesso ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Enviado!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Enviar Resposta</span>
                  </>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Mensagem de Erro Simplificada */}
        {submissaoError && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-4">
            <p className="text-red-700 text-center font-medium">
              ❌ {submissaoError}
            </p>
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
