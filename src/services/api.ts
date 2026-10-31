import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3333;

/**
 * Resolve a URL da API automaticamente:
 * 1. Se EXPO_PUBLIC_API_URL estiver definida (ex.: produção), usa ela.
 * 2. Senão, usa o IP da máquina que está rodando o Expo (Metro), que é a
 *    mesma máquina da API em desenvolvimento. Assim funciona em qualquer rede.
 */
function resolveBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).expoGoConfig?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(':')[0];

  if (host) return `http://${host}:${API_PORT}`;
  if (Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}`;
  return `http://localhost:${API_PORT}`;
}

export const BASE_URL = resolveBaseUrl();

interface RequestOptions extends RequestInit {
  token?: string | null;
}

let authTokenProvider: (() => string | null) | null = null;

/**
 * Registra o provedor de token JWT vindo da store de autenticação.
 */
export function registerAuthTokenProvider(provider: () => string | null) {
  authTokenProvider = provider;
}

async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, headers, ...restOptions } = options;
  const resolvedToken = token !== undefined ? token : authTokenProvider?.();

  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const response = await fetch(`${BASE_URL}${normalizedEndpoint}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.error ||
      data?.message ||
      `Erro na requisição (${response.status})`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  baseURL: BASE_URL,

  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
