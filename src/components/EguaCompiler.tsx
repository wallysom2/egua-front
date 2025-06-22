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
      {/* Header Simplificado */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          💻 Digite seu código
        </h4>
        <button
          onClick={handleExecutar}
          disabled={executando || !codigo.trim() || disabled}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {executando ? 'Executando...' : '▶️ Executar'}
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

      {/* Resultado Simplificado */}
      <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="p-3 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <h4 className="text-slate-700 dark:text-slate-300 font-semibold">
            📤 Resultado
          </h4>
        </div>
        <div
          className={`p-4 font-mono text-base min-h-[120px] max-h-[300px] overflow-y-auto ${
            resultado
              ? resultado.sucesso
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}
        >
          {resultado ? (
            resultado.saida.length > 0 ? (
              resultado.saida.map((linha, index) => (
                <div key={index} className="mb-2 text-base">
                  {linha}
                </div>
              ))
            ) : (
              <div className="text-slate-500 dark:text-slate-400 text-base">
                {resultado.erro || 'Código executado com sucesso'}
              </div>
            )
          ) : (
            <div className="text-slate-400 dark:text-slate-500 text-base">
              Clique em Executar para ver o resultado aqui
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
