'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GradientButton } from '@/components/GradientButton';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ScrollProgress } from '@/components/ScrollProgress';
import { Tooltip } from '@/components/Tooltip';

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors"
    >
      <ScrollProgress />

      {/* Navbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full z-40 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Tooltip content="Voltar para o início">
              <Link
                href="/"
                className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
              >
                <Image
                  src="/hu.png"
                  alt="Senior Code AI Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                Senior Code AI
              </Link>
            </Tooltip>
          </motion.div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Tooltip content="Acessar sua conta">
                <Link
                  href="/login"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-2 shadow-lg text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                    />
                  </svg>
                  Entrar
                </Link>
              </Tooltip>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        style={{ opacity, scale }}
        className="flex-1 flex items-center justify-center py-20 pt-32"
      >
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
      
              <motion.span
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                Senior Code AI
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-2xl mx-auto mb-12 text-slate-600 dark:text-slate-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Uma jornada simplificada para aprender sobre Pensamento Computacional com auxílio de Inteligência Artificial, especialmente
              pensada para você que está começando no mundo da programação.
            </motion.p>

            {/* Indicadores de progresso visual */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-8 mb-12 text-slate-500 dark:text-slate-400"
            >
              {[
                {
                  icon: '📚',
                  text: 'Aprenda',
                  tooltip: 'Conteúdo didático e estruturado',
                },
                {
                  icon: '💻',
                  text: 'Pratique',
                  tooltip: 'Exercícios práticos e interativos',
                },
                {
                  icon: '🚀',
                  text: 'Crie',
                  tooltip: 'Projetos reais para seu portfólio',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Tooltip content={item.tooltip}>
                    <motion.span
                      className="text-2xl cursor-help"
                      animate={{
                        y: [0, -5, 0],
                        rotate: [0, 5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    >
                      {item.icon}
                    </motion.span>
                  </Tooltip>
                  <span>{item.text}</span>
                  {index < 2 && (
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full" />
                  )}
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <Tooltip content="Comece sua jornada agora mesmo">
                <GradientButton href="/cadastro">
                  🚀 Começar Agora →
                </GradientButton>
              </Tooltip>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-20 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Por que escolher o Senior Code AI?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Uma plataforma completa pensada para o seu desenvolvimento
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: '👋',
                title: 'Fácil de Começar',
                gradient: 'from-green-500 to-green-600',
                tooltip: 'Comece do zero sem complicações',
              },
              {
                icon: '⏱️',
                title: 'Aprenda no seu Ritmo',
                gradient: 'from-blue-500 to-blue-600',
                tooltip: 'Estude quando e onde quiser',
              },
              {
                icon: '👥',
                title: 'Feedback imediato',
                gradient: 'from-purple-500 to-purple-600',
                tooltip: 'Receba feedback instantâneo com IA',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="group bg-white dark:bg-slate-900 p-8 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xl"
              >
                <div className="text-center">
                  <Tooltip content={feature.tooltip}>
                    <motion.div
                      className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 cursor-help`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        className="text-3xl"
                        animate={{
                          y: [0, -5, 0],
                          rotate: [0, 5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      >
                        {feature.icon}
                      </motion.span>
                    </motion.div>
                  </Tooltip>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-6 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <motion.h2
              className="text-4xl font-bold mb-6 text-slate-900 dark:text-white"
              whileHover={{ scale: 1.02 }}
            >
              Pronto para começar sua jornada?
            </motion.h2>
            <motion.p
              className="text-xl text-slate-600 dark:text-slate-300 mb-8"
              whileHover={{ scale: 1.02 }}
            >
              Junte-se aos outros estudantes que já estão aprendendo
              programação com o Senior Code AI
            </motion.p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Tooltip content="Crie sua conta gratuitamente">
                <GradientButton href="/cadastro">
                  🎯 Criar Conta Gratuita
                </GradientButton>
              </Tooltip>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
        <div className="container mx-auto px-6 text-center">
          <motion.p
            className="text-slate-600 dark:text-slate-400"
            whileHover={{ scale: 1.02 }}
          >
            🏛️ Senior Code AI - Aprenda programação de forma simples
          </motion.p>
        </div>
      </footer>
    </div>
  );
}
