import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Navbar */}
      <div className="py-4 border-b border-slate-800">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-blue-400">
            Égua
          </Link>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 rounded-lg bg-slate-800 flex items-center gap-2">
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
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" 
                />
              </svg>
              Claro
            </button>
            <Link href="/login" className="px-6 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors flex items-center gap-2">
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
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Aprenda a Programar <br />
            <span className="text-blue-400">com Égua</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 text-slate-300">
            Uma jornada simplificada para aprender programação, especialmente
            pensada para você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/cadastro" 
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all text-lg font-medium inline-flex items-center justify-center"
            >
              Começar Agora →
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all text-lg font-medium inline-flex items-center justify-center"
            >
              Já tenho uma conta
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-6 rounded-xl hover:bg-slate-800 transition-colors">
              <div className="mb-4 text-4xl">👋</div>
              <h2 className="text-xl font-bold">Fácil de Começar</h2>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl hover:bg-slate-800 transition-colors">
              <div className="mb-4 text-4xl">⏱️</div>
              <h2 className="text-xl font-bold">Aprenda no seu Ritmo</h2>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl hover:bg-slate-800 transition-colors">
              <div className="mb-4 text-4xl">👥</div>
              <h2 className="text-xl font-bold">Comunidade Ativa</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
