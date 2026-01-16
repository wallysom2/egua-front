import { API_BASE_URL } from '@/config/api';
import { createClient } from '@/lib/supabase/client';

/**
 * Classe para gerenciar requisições HTTP de forma centralizada
 * Usa o token de autenticação do Supabase automaticamente
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtém os headers padrão para as requisições
   * O token é obtido da sessão do Supabase
   */
  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Apenas no browser, obter token da sessão do Supabase
    if (typeof window !== 'undefined') {
      try {
        const supabase = createClient();

        // Primeiro tenta obter a sessão existente
        let { data: { session }, error } = await supabase.auth.getSession();

        // Se a sessão existe mas pode estar expirada, tentar refresh
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const fiveMinutes = 5 * 60 * 1000;

          // Se o token expira em menos de 5 minutos, fazer refresh
          if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
            console.log('[API Client] Token próximo de expirar, fazendo refresh...');
            const refreshResult = await supabase.auth.refreshSession();
            if (!refreshResult.error && refreshResult.data.session) {
              session = refreshResult.data.session;
            }
          }
        }

        if (session?.access_token) {
          // Validação básica do token (deve ter 3 partes separadas por .)
          const tokenParts = session.access_token.split('.');
          if (tokenParts.length === 3) {
            headers.Authorization = `Bearer ${session.access_token}`;
          } else {
            console.error('[API Client] Token inválido detectado (segmentos incorretos):', tokenParts.length);
            // Tentar fazer refresh forçado
            const refreshResult = await supabase.auth.refreshSession();
            if (!refreshResult.error && refreshResult.data.session?.access_token) {
              const newTokenParts = refreshResult.data.session.access_token.split('.');
              if (newTokenParts.length === 3) {
                headers.Authorization = `Bearer ${refreshResult.data.session.access_token}`;
              }
            }
          }
        } else if (error) {
          console.warn('[API Client] Erro ao obter sessão:', error.message);
        }
      } catch (error) {
        console.warn('[API Client] Erro ao obter sessão Supabase:', error);
      }
    }

    return headers;
  }

  /**
   * Processa a resposta da API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Se não autenticado, fazer logout do Supabase
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch (error) {
          console.warn('Erro ao fazer signOut:', error);
        }

        // Apenas redireciona se não estiver em rotas públicas
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
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
      headers: await this.getHeaders(),
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
      headers: await this.getHeaders(),
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
      headers: await this.getHeaders(),
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
      headers: await this.getHeaders(),
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
      headers: await this.getHeaders(),
      ...options,
    });
    return this.handleResponse<T>(response);
  }
}

/**
 * Instância única do cliente de API
 * Use esta instância em todo o projeto para fazer requisições
 * O token do Supabase é anexado automaticamente
 * 
 * @example
 * ```typescript
 * import { apiClient } from '@/lib/api-client';
 * 
 * // GET
 * const exercicios = await apiClient.get('/exercicios');
 * 
 * // POST
 * const resultado = await apiClient.post('/respostas', { resposta });
 * 
 * // PUT
 * await apiClient.put('/exercicios/1', exercicioData);
 * 
 * // DELETE
 * await apiClient.delete('/exercicios/1');
 * ```
 */
export const apiClient = new ApiClient(API_BASE_URL);
