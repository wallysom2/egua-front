/**
 * Configurações da API
 * Centralizadas para facilitar mudanças futuras
 */

// URL base da API - mudança centralizada aqui reflete em todo o projeto
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Outras configurações da API podem ser adicionadas aqui
export const API_TIMEOUT = 10000; // 10 segundos
export const API_RETRY_ATTEMPTS = 3;

// Headers padrão para requisições
export const getDefaultHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Função helper para fazer requisições com configurações padrão
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('token');
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getDefaultHeaders(token || undefined),
      ...options.headers,
    },
  });
};
