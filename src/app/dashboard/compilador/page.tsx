'use client';

import { useState } from 'react';
import Link from 'next/link';
import { executarCodigo as executarCodigoDelegua } from '@/lib/delegua';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BackButton } from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';

export default function Compilador() {
  const { user, logout, isLoading } = useAuth();
  const [codigo, setCodigo] = useState(`escreva("Olá, mundo!");`);
  const [saida, setSaida] = useState<string[]>([]);
  const [executando, setExecutando] = useState(false);

  const executarCodigo = async () => {
    try {
      setExecutando(true);
      setSaida(['Executando código...']);
      const resultado = await executarCodigoDelegua(codigo);
      setSaida(resultado);
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      setSaida([`Erro ao executar código: ${errorMessage}`]);
    } finally {
      setExecutando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Navbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/dashboard"
                className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <Image
                  src="/hu.png"
                  alt="Senior Code AI Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span>Senior Code AI</span>
              </Link>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <p className="font-medium mr-4">
                  Olá, {user?.nome?.split(' ')[0] || 'Aluno'}
                </p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-lg"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botão Voltar */}
      <BackButton href="/dashboard" />

      {/* Conteúdo Principal */}
      <main className="flex-1 py-16 pt-32">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Compilador Senior Code AI
            </h1>
            <p className="text-slate-600 text-xl">
              Execute código em tempo real e veja os resultados instantaneamente
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor de Código */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Editor de Código</h2>
                <button
                  onClick={executarCodigo}
                  disabled={executando}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    executando
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {executando ? 'Executando...' : 'Executar'}
                </button>
              </div>
              <div className="w-full h-[400px] border border-slate-200 rounded-lg overflow-hidden">
                <CodeMirror
                  value={codigo}
                  height="400px"
                  theme={oneDark}
                  extensions={[javascript()]}
                  onChange={(value) => setCodigo(value)}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightSpecialChars: true,
                    foldGutter: true,
                    drawSelection: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    syntaxHighlighting: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: true,
                    crosshairCursor: true,
                    highlightActiveLine: true,
                    highlightSelectionMatches: true,
                    closeBracketsKeymap: true,
                    searchKeymap: true,
                    foldKeymap: true,
                    completionKeymap: true,
                    lintKeymap: true,
                  }}
                />
              </div>
            </div>

            {/* Área de Saída */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">Saída</h2>
              <div className="w-full h-[400px] p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm overflow-auto">
                {saida.map((linha, index) => (
                  <div
                    key={index}
                    className={`mb-1 ${
                      linha.startsWith('Erro')
                        ? 'text-red-600'
                        : linha === 'Executando código...'
                        ? 'text-blue-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {linha}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="py-4 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 text-lg">
            Senior Code AI - Plataforma de Aprendizado de Programação
          </p>
        </div>
      </footer>
    </div>
  );
}
