"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('módulos');

  useEffect(() => {
    // Verificar se o usuário está logado
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Erro ao processar dados do usuário:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl">Carregando...</p>
      </div>
    );
  }

  const progressModules = [
    { id: 1, title: "Introdução à Programação", completed: true, progress: 100 },
    { id: 2, title: "Variáveis e Tipos de Dados", completed: true, progress: 100 },
    { id: 3, title: "Estruturas Condicionais", completed: false, progress: 60 },
    { id: 4, title: "Laços de Repetição", completed: false, progress: 0 },
    { id: 5, title: "Funções", completed: false, progress: 0 },
  ];

  const nextClasses = [
    { id: 1, title: "Condicionais Avançadas", date: "Hoje, 15:00", module: "Módulo 3" },
    { id: 2, title: "Exercícios Práticos", date: "Amanhã, 15:00", module: "Módulo 3" },
    { id: 3, title: "Introdução a Laços", date: "Quinta, 15:00", module: "Módulo 4" },
  ];

  const myProjects = [
    { id: 1, title: "Calculadora Simples", completed: true, previewImage: "🧮" },
    { id: 2, title: "Jogo de Adivinhação", completed: false, progress: 75, previewImage: "🎮" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Navbar */}
      <div className="py-4 border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-3xl font-bold text-blue-400">
            Égua
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-slate-300 hover:text-white">
                Dashboard
              </Link>
              <Link href="/dashboard/aulas" className="text-slate-300 hover:text-white">
                Aulas
              </Link>
              <Link href="/dashboard/projetos" className="text-slate-300 hover:text-white">
                Projetos
              </Link>
              <Link href="/dashboard/comunidade" className="text-slate-300 hover:text-white">
                Comunidade
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-medium">
                  {user?.nome?.charAt(0) || 'U'}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className="font-medium">{user?.nome || 'Usuário'}</p>
                  <p className="text-sm text-slate-400 capitalize">{user?.tipo || 'aluno'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Cabeçalho */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Olá, {user?.nome?.split(' ')[0] || 'Aluno'}!</h1>
            <p className="text-slate-400 text-lg">Bem-vindo de volta ao seu painel de aprendizado</p>
          </div>

          {/* Resumo em cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-900 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-900/50 flex items-center justify-center text-2xl mr-4">
                  📚
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-400">Seu Progresso</h3>
                  <p className="text-2xl font-bold">40% Completo</p>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: "40%" }}></div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-900/50 flex items-center justify-center text-2xl mr-4">
                  ✅
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-400">Exercícios</h3>
                  <p className="text-2xl font-bold">12 Concluídos</p>
                </div>
              </div>
              <p className="text-slate-400">2 exercícios pendentes no Módulo 3</p>
            </div>

            <div className="bg-slate-900 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-900/50 flex items-center justify-center text-2xl mr-4">
                  🏆
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-400">Certificados</h3>
                  <p className="text-2xl font-bold">2 Conquistados</p>
                </div>
              </div>
              <p className="text-slate-400">Continue aprendendo para ganhar mais!</p>
            </div>
          </div>

          {/* Seletor de Abas */}
          <div className="border-b border-slate-800 mb-8">
            <div className="flex overflow-x-auto space-x-6">
              <button 
                onClick={() => setActiveTab('módulos')}
                className={`py-3 font-medium text-lg border-b-2 ${
                  activeTab === 'módulos' 
                    ? 'border-blue-400 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Módulos de Aprendizado
              </button>
              <button 
                onClick={() => setActiveTab('próximas-aulas')}
                className={`py-3 font-medium text-lg border-b-2 ${
                  activeTab === 'próximas-aulas' 
                    ? 'border-blue-400 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Próximas Aulas
              </button>
              <button 
                onClick={() => setActiveTab('projetos')}
                className={`py-3 font-medium text-lg border-b-2 ${
                  activeTab === 'projetos' 
                    ? 'border-blue-400 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Meus Projetos
              </button>
            </div>
          </div>

          {/* Conteúdo das Abas */}
          
          {/* Aba Módulos */}
          {activeTab === 'módulos' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Seu Progresso nos Módulos</h2>
              {progressModules.map((module) => (
                <div key={module.id} className="bg-slate-900 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Módulo {module.id}: {module.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      module.completed 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-blue-900/30 text-blue-400'
                    }`}>
                      {module.completed ? 'Concluído' : `${module.progress}% Concluído`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${module.completed ? 'bg-green-500' : 'bg-blue-500'}`} 
                         style={{ width: `${module.progress}%` }}></div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link 
                      href={`/dashboard/modulos/${module.id}`}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                    >
                      {module.completed ? 'Revisitar' : 'Continuar'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Aba Próximas Aulas */}
          {activeTab === 'próximas-aulas' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Próximas Aulas ao Vivo</h2>
              <div className="space-y-4">
                {nextClasses.map((classItem) => (
                  <div key={classItem.id} className="bg-slate-900 rounded-xl p-6 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-blue-400">{classItem.module}</span>
                      <h3 className="text-lg font-medium mt-1">{classItem.title}</h3>
                      <p className="text-slate-400">{classItem.date}</p>
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        Lembrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aba Projetos */}
          {activeTab === 'projetos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Meus Projetos</h2>
                <Link href="/dashboard/novoprojeto" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Novo Projeto
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myProjects.map((project) => (
                  <div key={project.id} className="bg-slate-900 rounded-xl overflow-hidden">
                    <div className="h-40 bg-blue-900/30 flex items-center justify-center text-6xl">
                      {project.previewImage}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium">{project.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          project.completed 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-blue-900/30 text-blue-400'
                        }`}>
                          {project.completed ? 'Concluído' : `${project.progress}%`}
                        </span>
                      </div>
                      {!project.completed && (
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                          <div className="bg-blue-500 h-full" 
                                style={{ width: `${project.progress}%` }}></div>
                        </div>
                      )}
                      <div className="mt-4 flex justify-end">
                        <Link 
                          href={`/dashboard/projetos/${project.id}`}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                        >
                          {project.completed ? 'Visualizar' : 'Continuar'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-6 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 mb-4 md:mb-0">© 2023 Égua - Plataforma de Aprendizado</p>
            <div className="flex space-x-6">
              <Link href="/dashboard/ajuda" className="text-slate-400 hover:text-white">Ajuda</Link>
              <Link href="/dashboard/suporte" className="text-slate-400 hover:text-white">Suporte</Link>
              <a href="https://wa.me/5591999999999" className="text-slate-400 hover:text-white">WhatsApp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 