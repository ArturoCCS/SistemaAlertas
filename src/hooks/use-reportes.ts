import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  crearReporte,
  listarMisReportes,
  listarReportesPublicos,
  type CrearReporteInput,
} from '@/src/services/reportes';

export function useReportesPublicos() {
  return useQuery({
    queryKey: ['reportes', 'publicos'],
    queryFn: listarReportesPublicos,
  });
}

export function useMisReportes() {
  return useQuery({
    queryKey: ['reportes', 'mios'],
    queryFn: listarMisReportes,
  });
}

export function useCrearReporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CrearReporteInput) => crearReporte(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reportes', 'publicos'] }),
        queryClient.invalidateQueries({ queryKey: ['reportes', 'mios'] }),
      ]);
    },
  });
}
