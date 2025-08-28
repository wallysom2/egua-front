import { useState, useEffect, useRef } from 'react';
import { useEguaCompiler } from '@/hooks/useEguaCompiler';

interface EguaCompilerProps {
  codigoInicial?: string;
  altura?: string;
  onResultado?: (resultado: {
    sucesso: boolean;
    saida: string[];
    erro?: string;
  }) => void;
  onCodigoChange?: (codigo: string) => void;
  mostrarTempo?: boolean;
  atalhoTeclado?: boolean;
  disabled?: boolean;
  className?: string;
}

export function EguaCompiler({
  codigoInicial = 'escreva("Olá, Mundo!");',
  altura = 'h-64 lg:h-80',
  onResultado,
  onCodigoChange,
  atalhoTeclado = true,
  disabled = false,
  className = '',
}: EguaCompilerProps) {
  const [codigo, setCodigo] = useState(codigoInicial);
  const { executando, resultado, executarCodigo } =
    useEguaCompiler();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-foco no editor quando carrega
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Callback para resultado
  useEffect(() => {
    if (resultado && onResultado) {
      onResultado({
        sucesso: resultado.sucesso,
        saida: resultado.saida,
        erro: resultado.erro,
      });
    }
  }, [resultado, onResultado]);

  const handleExecutar = async () => {
    if (!codigo.trim() || disabled || executando) return;
    await executarCodigo(codigo);
  };

  // Atalho de teclado para executar (Ctrl/Cmd + Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (atalhoTeclado && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecutar();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Melhorado */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Editor de Código
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {atalhoTeclado ? 'Pressione Ctrl+Enter para executar' : 'Clique em executar para testar'}
          </p>
        </div>
        <button
          onClick={handleExecutar}
          disabled={executando || !codigo.trim() || disabled}
          className={`group relative px-6 py-2.5 font-semibold text-white rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg ${
            executando
              ? 'bg-slate-400 cursor-not-allowed shadow-slate-400/25'
              : !codigo.trim() || disabled
              ? 'bg-slate-400 cursor-not-allowed shadow-slate-400/25'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-green-500/25 hover:shadow-green-500/40'
          }`}
        >
          <div className="flex items-center space-x-2">
            {executando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Executando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Executar</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Editor Simplificado */}
      <textarea
        ref={textareaRef}
        value={codigo}
        onChange={(e) => {
          setCodigo(e.target.value);
          onCodigoChange?.(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full ${altura} bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4 text-slate-900 dark:text-white font-mono text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none`}
        placeholder="escreva('Olá, Mundo!');"
        disabled={disabled || executando}
        spellCheck={false}
        autoComplete="off"
      />

      {/* Painel de Resultado Melhorado */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <h4 className="text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Console de Saída</span>
            </h4>
            {resultado && (
              <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                resultado.sucesso 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {resultado.sucesso ? 'Sucesso' : 'Erro'}
              </div>
            )}
          </div>
        </div>
        <div
          className={`p-4 font-mono text-sm min-h-[120px] max-h-[300px] overflow-y-auto transition-colors ${
            resultado
              ? resultado.sucesso
                ? 'bg-green-50/50 dark:bg-green-900/10 text-green-800 dark:text-green-300'
                : 'bg-red-50/50 dark:bg-red-900/10 text-red-800 dark:text-red-300'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'
          }`}
        >
          {resultado ? (
            resultado.saida.length > 0 ? (
              resultado.saida.map((linha, index) => (
                <div key={index} className="mb-1 leading-relaxed">
                  <span className="text-slate-400 dark:text-slate-500 mr-2">{index + 1}.</span>
                  {linha}
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-2">
                <svg className={`w-4 h-4 ${resultado.sucesso ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                  {resultado.sucesso ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  )}
                </svg>
                <span>{resultado.erro || 'Código executado com sucesso (sem saída)'}</span>
              </div>
            )
          ) : (
            <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Execute seu código para ver o resultado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
