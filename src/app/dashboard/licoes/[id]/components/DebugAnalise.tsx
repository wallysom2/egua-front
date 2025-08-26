import { useState } from 'react';

interface DebugAnaliseProps {
  respostaId: string | null;
  progressoId: string | null;
  userId: string | number | undefined;
  exercicioId: string | number | undefined;
}

export function DebugAnalise({
  respostaId,
  progressoId,
  userId,
  exercicioId,
}: DebugAnaliseProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-purple-700 transition-colors"
      >
        🐛 Debug
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-xl w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-slate-900 dark:text-white">
              Debug - Análise Gemini
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-slate-700 dark:text-slate-300">
                Estado Atual:
              </strong>
              <div className="mt-1 space-y-1">
                <div
                  className={`p-2 rounded text-xs ${
                    respostaId
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  }`}
                >
                  Resposta ID: {respostaId || 'Não definido'}
                </div>
                <div
                  className={`p-2 rounded text-xs ${
                    progressoId
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                  }`}
                >
                  Progresso ID: {progressoId || 'Não criado ainda'}
                </div>
                <div
                  className={`p-2 rounded text-xs ${
                    userId
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  }`}
                >
                  User ID: {userId || 'Não definido'}
                </div>
                <div
                  className={`p-2 rounded text-xs ${
                    exercicioId
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  }`}
                >
                  Exercicio ID: {exercicioId || 'Não definido'}
                </div>
              </div>
            </div>

            <div>
              <strong className="text-slate-700 dark:text-slate-300">
                URLs para Teste:
              </strong>
              <div className="mt-1 space-y-1">
                {respostaId ? (
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs break-all">
                    GET /respostas/analise/{respostaId}
                  </div>
                ) : (
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-500 dark:text-slate-400">
                    Submeta uma resposta primeiro
                  </div>
                )}
              </div>
            </div>

            <div>
              <strong className="text-slate-700 dark:text-slate-300">
                Fluxo:
              </strong>
              <ol className="mt-1 space-y-1 text-xs">
                <li
                  className={`flex items-center gap-2 ${
                    userId && exercicioId ? 'text-green-600' : 'text-slate-500'
                  }`}
                >
                  {userId && exercicioId ? '✅' : '⏳'} 1. Dados de
                  usuário/exercício
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    progressoId ? 'text-green-600' : 'text-slate-500'
                  }`}
                >
                  {progressoId ? '✅' : '⏳'} 2. Progresso criado
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    respostaId ? 'text-green-600' : 'text-slate-500'
                  }`}
                >
                  {respostaId ? '✅' : '⏳'} 3. Resposta submetida
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  ⏳ 4. Análise processada (IA)
                </li>
              </ol>
            </div>

            <div>
              <strong className="text-slate-700 dark:text-slate-300">
                Local Storage:
              </strong>
              <div className="mt-1 text-xs">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                  Token:{' '}
                  {localStorage.getItem('token') ? 'Presente' : 'Ausente'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
