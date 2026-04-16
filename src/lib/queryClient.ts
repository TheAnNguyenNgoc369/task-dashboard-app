/**
 * lib/queryClient.ts
 *
 * TanStack Query configuration.
 *
 * This file is the "seam" between the current localStorage implementation
 * and a future REST/GraphQL backend. To upgrade:
 *
 * 1. Replace `useTasksStore` reads in components with `useQuery`:
 *
 *    const { data: tasks = [] } = useQuery({
 *      queryKey: tasksKeys.all,
 *      queryFn: () => api.get('/tasks'),
 *    });
 *
 * 2. Replace store mutations with `useMutation`:
 *
 *    const create = useMutation({
 *      mutationFn: (data: TaskFormData) => api.post('/tasks', data),
 *      onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKeys.all }),
 *    });
 *
 * 3. Wrap <App /> with <QueryClientProvider client={queryClient}>.
 *
 * The component props and custom hook interfaces (useTasks, useTask) stay
 * identical — only the data source changes.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes before background refetch
      gcTime: 1000 * 60 * 30,     // 30 minutes in garbage-collection cache
      retry: 2,
      refetchOnWindowFocus: false, // Disable for offline-first demo
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Structured query key factory.
 * Lets you invalidate slices: invalidateQueries({ queryKey: tasksKeys.byCol('backlog') })
 */
export const tasksKeys = {
  all:       ['tasks']                          as const,
  byCol:     (col: string) => ['tasks', col]    as const,
  detail:    (id: string)  => ['tasks', 'id', id] as const,
};
