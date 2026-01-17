'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Users, Code } from 'lucide-react';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { DashboardCard } from '@/components/DashboardCard';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const { user, signOut, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <Loading text="Carregando..." />;
  }

  return (
    <>
      <Header variant="dashboard" user={user} onLogout={signOut} />

      {/* Módulos Principais */}
      <main className="flex-grow py-16 pt-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Conteúdo */}
            <DashboardCard
              title="Conteúdo Teórico"
              description="Materiais didáticos estruturados."
              icon={BookOpen}
              color="blue"
              href="/dashboard/conteudo"
              delay={0.2}
              buttonText={user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                ? 'Adicionar Conteúdo'
                : 'Estudar Conteúdo'}
            />

            {/* Turmas */}
            <DashboardCard
              title="Turmas"
              description={user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                ? 'Crie turmas e acompanhe seus alunos.'
                : 'Acesse suas turmas e trilhas de aprendizado.'}
              icon={Users}
              color="brand"
              href={user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                ? '/dashboard/turmas'
                : '/dashboard/minhas-turmas'}
              delay={0.3}
              buttonText={user?.tipo === 'professor' || user?.tipo === 'desenvolvedor'
                ? 'Gerenciar Turmas'
                : 'Minhas Turmas'}
            />

            {/* Compilador */}
            <DashboardCard
              title="Compilador Online"
              description="Editor de código com execução em tempo real."
              icon={Code}
              color="purple"
              href="/dashboard/compilador"
              delay={0.4}
              buttonText="Abrir Compilador"
            />
          </div>
        </div>
      </main>
    </>
  );
}
