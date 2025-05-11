"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// API URL que pode ser substituída em produção
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      
      // Armazena o token no localStorage
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.usuario));

      // Redireciona após login bem-sucedido
      router.push("/dashboard");
    } catch (err) {
      setError(
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Erro ao fazer login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Navbar */}
      <div className="py-4 border-b border-slate-800">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-blue-400">
            Égua
          </Link>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center py-10">
        <div className="bg-slate-900 p-8 rounded-xl w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Entrar</h1>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" htmlFor="senha">
                Senha
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all text-lg font-medium flex justify-center items-center"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Não tem uma conta?{" "}
              <Link href="/cadastro" className="text-blue-400 hover:underline">
                Cadastre-sddfa
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 