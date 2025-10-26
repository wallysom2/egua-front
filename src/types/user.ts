/**
 * Tipos relacionados ao usuário
 */

export type TipoUsuario = 'aluno' | 'professor' | 'desenvolvedor';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  ativo?: boolean;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface CadastroData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  tipo: TipoUsuario;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    usuario: User;
    token: string;
  };
}

