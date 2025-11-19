import { API_BASE_URL } from '@/config/api';

/**
 * Classe para gerenciar requisições HTTP de forma centralizada
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtém os headers padrão para as requisições
   */
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Processa a resposta da API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Se não autenticado, redirecionar para login
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Apenas redireciona se não estiver em rotas públicas
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    // Tentar fazer parse do JSON
    const contentType = response.headers.get('content-type');
    const hasJson = contentType?.includes('application/json');

    if (!response.ok) {
      if (hasJson) {
        const error = await response.json();
        throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
      }
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    // Se a resposta não tiver conteúdo (204), retornar objeto vazio
    if (response.status === 204) {
      return {} as T;
    }

    if (hasJson) {
      return response.json();
    }

    // Se não for JSON, retornar texto como fallback
    return response.text() as unknown as T;
  }

  /**
   * Requisição GET
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Requisição POST
   */
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Requisição PUT
   */
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Requisição PATCH
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Requisição DELETE
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      ...options,
    });
    return this.handleResponse<T>(response);
  }
}

/**
 * Instância única do cliente de API
 * Use esta instância em todo o projeto para fazer requisições
 * 
 * @example
 * ```typescript
 * import { apiClient } from '@/lib/api-client';
 * 
 * // GET
 * const exercicios = await apiClient.get('/exercicios');
 * 
 * // POST
 * const resultado = await apiClient.post('/api/auth/login', { email, senha });
 * 
 * // PUT
 * await apiClient.put('/exercicios/1', exercicioData);
 * 
 * // DELETE
 * await apiClient.delete('/exercicios/1');
 * ```
 */
export const apiClient = new ApiClient(API_BASE_URL);

