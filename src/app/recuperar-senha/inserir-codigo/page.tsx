'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loading } from '@/components/Loading';
import { GradientButton } from '@/components/GradientButton';

// API URL que pode ser substituída em produção
import { API_BASE_URL } from '@/config/api';

function InserirCodigoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (codigo.length !== 6) {
      setError('O código deve ter 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/validar-token/${codigo}`);

      if (response.data.success) {
        setSuccess('Código válido! Redirecionando...');
        // Redirecionar para redefinir senha com o token
        setTimeout(() => {
          router.push(`/redefinir-senha?token=${codigo}`);
        }, 1500);
      } else {
        setError(response.data.message || 'Código inválido ou expirado');
      }
    } catch (err) {
      setError(
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Erro ao validar código',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Apenas números
    if (value.length <= 6) {
      setCodigo(value);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold">
          <Image
            src="/logo.svg"
            alt="Senior Code AI"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          Senior Code AI
        </Link>
        <ThemeToggle />
      </div>

      {/* Inserir Código Form */}
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-full max-w-md mx-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Inserir Código</h1>

              {email && (
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  {email}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {success}
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    className="block text-base font-medium mb-2 text-slate-700 dark:text-slate-300"
                    htmlFor="codigo"
                  >
                    Código de Recuperação
                  </label>
                  <input
                    type="text"
                    id="codigo"
                    name="codigo"
                    value={codigo}
                    onChange={handleCodigoChange}
                    className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div>
                  <GradientButton
                    type="submit"
                    disabled={loading || codigo.length !== 6}
                    loading={loading}
                    className="w-full"
                  >
                    Verificar Código
                  </GradientButton>
                </div>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Não recebeu o código?{' '}
                <Link
                  href="/recuperar-senha"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Solicitar novamente
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InserirCodigo() {
  return (
    <Suspense fallback={<Loading text="Carregando..." />}>
      <InserirCodigoContent />
    </Suspense>
  );
}
