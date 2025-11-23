'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, GraduationCap, Building2, Mail, ArrowLeft } from 'lucide-react';

export default function Sobre() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Header variant="home" logoHref="/" logoSize="lg" />

      {/* Conteúdo Principal */}
      <main className="flex-1 py-16 pt-28">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Título */}
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-semibold mb-3 text-slate-900 dark:text-slate-100 tracking-tight">
                Sobre o Projeto
              </h1>
              <div className="w-16 h-0.5 bg-slate-300 dark:bg-slate-700 mx-auto"></div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-10">
              {/* Equipe de Desenvolvimento */}
              <section>
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  Equipe
                </h2>
                <div className="space-y-2.5">
                  <div className="py-3 px-4 border-l-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-slate-800 dark:text-slate-200">
                      CINTIA REIS DE OLIVEIRA
                    </p>
                  </div>
                  <div className="py-3 px-4 border-l-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-slate-800 dark:text-slate-200">
                      FLAVIA JAMILY DOS SANTOS MACENA
                    </p>
                  </div>
                  <div className="py-3 px-4 border-l-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-slate-800 dark:text-slate-200">
                      ISABELE DE OLIVEIRA FERREIRA
                    </p>
                  </div>
                  <div className="py-3 px-4 border-l-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-slate-800 dark:text-slate-200">
                      PEDRO LUCAS DE SOUZA MARTINS
                    </p>
                  </div>
                  <div className="py-3 px-4 border-l-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-slate-800 dark:text-slate-200">
                      WALLYSON MATHEUS SOUZA DE OLIVEIRA
                    </p>
                  </div>
                </div>
              </section>

              {/* Divisor */}
              <div className="border-t border-slate-200 dark:border-slate-800"></div>

              {/* Orientação */}
              <section>
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  Orientação
                </h2>
                <div className="py-4 px-4 border-l-2 border-blue-500 dark:border-blue-400 bg-blue-50/30 dark:bg-blue-950/20">
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
                    Profa. Dra. ISABEL DILLMANN NUNES
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Professora Orientadora do Projeto
                  </p>
                </div>
              </section>

              {/* Divisor */}
              <div className="border-t border-slate-200 dark:border-slate-800"></div>

              {/* Instituição */}
              <section>
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  Instituição de Ensino
                </h2>
                <div className="space-y-2.5">
                  <div className="py-3 px-4 border-l-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-slate-800 dark:text-slate-200">
                      Universidade Federal do Rio Grande do Norte (UFRN)
                    </p>
                  </div>
                  <div className="py-3 px-4 border-l-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-slate-800 dark:text-slate-200">
                      PROEIDI - Projeto de Inclusão Digital para Idosos
                    </p>
                  </div>
                </div>
              </section>

              {/* Divisor */}
              <div className="border-t border-slate-200 dark:border-slate-800"></div>

              {/* Contato */}
              <section>
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  Informações de Contato
                </h2>
                <div className="py-3 px-4 border-l-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                  <a
                    href="mailto:bel@imd.ufrn.br"
                    className="text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    bel@imd.ufrn.br
                  </a>
                </div>
              </section>
            </div>

            {/* Botão Voltar */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para a página inicial
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Senior Code AI - Plataforma Educacional para Ensino de Pensamento Computacional
          </p>
        </div>
      </footer>
    </div>
  );
}
