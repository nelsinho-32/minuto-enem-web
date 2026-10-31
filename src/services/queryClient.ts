import { QueryClient } from '@tanstack/react-query';

/**
 * Instância global do QueryClient configurada para arquitetura Offline-First.
 * - networkMode: 'offlineFirst' garante que queries com cache local funcionem sem rede.
 * - staleTime e gcTime estendidos para preservar os dados em uso offline.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 60 * 24, // 24 horas em memória
      retry: 1,
      refetchOnReconnect: true,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

