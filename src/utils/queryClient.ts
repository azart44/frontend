import { QueryClient } from '@tanstack/react-query';

// Configuration optimisée de React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Ne pas réessayer les erreurs 404 ou 401
        if (error?.response?.status === 404 || error?.response?.status === 401) {
          return false;
        }
        // Limiter les tentatives à 3 maximum
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff capped at 30 seconds
      refetchOnWindowFocus: false, // Désactiver le refetch automatique lors du focus sur la fenêtre
    },
    mutations: {
      retry: false, // Ne pas réessayer les mutations qui échouent
    },
  },
});

// Utilisation correcte des query defaults
queryClient.setQueryDefaults(['*'], {
  queryFn: async () => {
    throw new Error('Query function not implemented');
  }
});