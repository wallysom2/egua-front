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
  mostrarTempo?: boolean;
  atalhoTeclado?: boolean;
  disabled?: boolean;
  className?: string;
}

export function EguaCompiler({
  codigoInicial = 'escreva("Olá, Mundo!");',
  altura = 'h-64 lg:h-80',
  onResultado,
  mostrarTempo = true,
  atalhoTeclado = true,
  disabled = false,
  className = '',
}: EguaCompilerProps) {
  const [codigo, setCodigo] = useState(codigoInicial);
  const { executando, resultado, executarCodigo, limparResultado } =
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

  const linhas = codigo.split('\n').length;
  const caracteres = codigo.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header do Editor */}
      <div className="flex items-center justify-between">
        <label className="block text-slate-700 dark:text-slate-300 font-medium">
          💻 Editor de Código Senior Code AI
        </label>
        <div className="text-xs text-slate-500 dark:text-slate-400 space-x-3">
          <span>
            {linhas} linha{linhas !== 1 ? 's' : ''}
          </span>
          <span>
            {caracteres} caractere{caracteres !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full ${altura} bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-4 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200`}
          placeholder="escreva('Olá, Mundo!');"
          disabled={disabled || executando}
          spellCheck={false}
          autoComplete="off"
        />

        {/* Badge Senior Code AI */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
            Senior Code AI
          </span>
        </div>

        {/* Dica de atalho */}
        {atalhoTeclado && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter para
              executar
            </span>
          </div>
        )}
      </div>

      {/* Botão Executar */}
      <button
        onClick={handleExecutar}
        disabled={executando || !codigo.trim() || disabled}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {executando ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Executando...
          </>
        ) : (
          <>▶️ Executar Código</>
        )}
      </button>

      {/* Resultado */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
              📤 Resultado da Execução
            </h4>
            {mostrarTempo && resultado?.tempoExecucao && (
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                {resultado.tempoExecucao}ms
              </span>
            )}
            {resultado && (
              <button
                onClick={limparResultado}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div
          className={`p-4 font-mono text-sm min-h-[120px] max-h-[300px] overflow-y-auto transition-all duration-300 ${
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
                <div key={index} className="mb-1">
                  {linha}
                </div>
              ))
            ) : (
              <div className="text-slate-500 dark:text-slate-400">
                {resultado.erro || 'Código executado sem saída'}
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <span>💡</span>
              <span>Execute o código para ver o resultado aqui...</span>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
        <span>
          {disabled ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              🔒 Editor bloqueado
            </span>
          ) : executando ? (
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              ⚡ Executando...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              ✏️ Pronto para programar
            </span>
          )}
        </span>
        <span>
          {codigo.trim() ? 'Pronto para executar' : 'Digite seu código'}
        </span>
      </div>
    </div>
  );
}
