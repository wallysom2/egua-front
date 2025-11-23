'use client';

import { Header } from '@/components/Header';
import { GradientButton } from '@/components/GradientButton';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ScrollProgress } from '@/components/ScrollProgress';
import { BookOpen, Code, Rocket, Hand, Clock, Users, Target, Building2 } from 'lucide-react';

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
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors"
    >
      <ScrollProgress />

      <Header variant="home" logoHref="/" logoSize="lg" />

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
              className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-slate-100"
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
              className="text-lg md:text-xl max-w-2xl mx-auto mb-12 text-slate-600 dark:text-slate-200 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Uma jornada simplificada para aprender sobre Pensamento Computacional com auxílio de Inteligência Artificial, especialmente
              pensada para você que está começando no mundo da programação.
            </motion.p>

            {/* Indicadores de progresso visual */}
            <div className="flex items-center justify-center gap-8 mb-12 text-slate-500 dark:text-slate-300">
              {[
                {
                  icon: BookOpen,
                  text: 'Aprenda',
                  tooltip: 'Conteúdo didático e estruturado',
                },
                {
                  icon: Code,
                  text: 'Pratique',
                  tooltip: 'Exercícios práticos e interativos',
                },
                {
                  icon: Rocket,
                  text: 'Crie',
                  tooltip: 'Projetos reais para seu portfólio',
                },
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.text}</span>
                    {index < 2 && (
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <GradientButton href="/login">
                Começar Agora →
              </GradientButton>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-20 bg-slate-50/50 dark:bg-slate-800/80">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Por que escolher o Senior Code AI?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-200 max-w-2xl mx-auto">
              Uma plataforma completa pensada para o seu desenvolvimento
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Hand,
                title: 'Comece aos Poucos',
                description:
                  'Interface intuitiva e conteúdo didático para iniciantes',
                gradient: 'from-green-500 to-green-600',
                tooltip: 'Comece do zero sem complicações',
              },
              {
                icon: Clock,
                title: 'Aprenda no seu Ritmo',
                gradient: 'from-blue-500 to-blue-600',
                tooltip: 'Estude quando e onde quiser',
              },
              {
                icon: Users,
                title: 'Retorno imediato',
                gradient: 'from-purple-500 to-purple-600',
                tooltip: 'Receba retorno instantâneo com IA',
              },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
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
                  className="group bg-white dark:bg-slate-800 p-8 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-2xl"
                >
                  <div className="text-center">
                    <motion.div
                      className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
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
                        <IconComponent className="w-10 h-10 text-white" />
                      </motion.div>
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                      {feature.title}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/40 dark:to-purple-900/40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-6 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <motion.h2
              className="text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100"
              whileHover={{ scale: 1.02 }}
            >
              Pronto para começar sua jornada?
            </motion.h2>
            <motion.p
              className="text-xl text-slate-600 dark:text-slate-200 mb-8"
              whileHover={{ scale: 1.02 }}
            >
              Junte-se aos outros estudantes que já estão aprendendo
              programação com o Senior Code AI
            </motion.p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <GradientButton href="/cadastro">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Criar Conta Gratuita
                </span>
              </GradientButton>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:footer-border-custom bg-slate-50/30 footer-bg">
        <div className="container mx-auto px-6 text-center">
          <motion.p
            className="text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <Building2 className="w-4 h-4" />
            Senior Code AI - Aprenda programação passo a passo
          </motion.p>
        </div>
      </footer>
    </div>
  );
}
