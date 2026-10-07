import { validarReglasConfirmacion } from '@/src/domain/confirmaciones';
import { mensajeConfiguracionSupabase, obtenerClienteSupabase } from '@/src/lib/supabase';
import type { Database } from '@/src/types/database';

import { ErrorConfiguracionSupabase } from './errores';

type ReportePublico = Database['public']['Views']['reportes_publicos']['Row'];
type ReportePropio = Database['public']['Tables']['reportes']['Row'];

type RespuestaRpc<T> = Promise<{
  data: T | null;
  error: { message: string } | null;
}>;

export type CrearReporteInput = {
  categoriaId: string;
  latitud: number;
  longitud: number;
  descripcion: string | null;
};

export async function listarReportesPublicos(): Promise<ReportePublico[]> {
  const supabase = obtenerClienteSupabase();

  if (!supabase) {
    throw new ErrorConfiguracionSupabase(mensajeConfiguracionSupabase());
  }

  const { data, error } = await supabase
    .from('reportes_publicos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listarMisReportes(): Promise<ReportePropio[]> {
  const supabase = obtenerClienteSupabase();

  if (!supabase) {
    throw new ErrorConfiguracionSupabase(mensajeConfiguracionSupabase());
  }

  const { data, error } = await supabase
    .from('reportes')
    .select(
      'id,categoria_id,creador_id,estado,descripcion,latitud_aproximada,longitud_aproximada,created_at,updated_at',
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function crearReporte(input: CrearReporteInput): Promise<string> {
  const supabase = obtenerClienteSupabase();

  if (!supabase) {
    throw new ErrorConfiguracionSupabase(mensajeConfiguracionSupabase());
  }

  const ejecutarCrearReporte = supabase.rpc as unknown as (
    funcion: 'crear_reporte',
    args: Database['public']['Functions']['crear_reporte']['Args'],
  ) => RespuestaRpc<string>;

  const { data, error } = await ejecutarCrearReporte('crear_reporte', {
    p_categoria_id: input.categoriaId,
    p_latitud: input.latitud,
    p_longitud: input.longitud,
    p_descripcion: input.descripcion,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('El servidor no devolvió el identificador del reporte.');
  }

  return data;
}

export async function confirmarReporte(input: {
  reporteId: string;
  creadorId: string;
  usuarioActualId: string;
  usuariosQueConfirmaron: string[];
}): Promise<string> {
  validarReglasConfirmacion({
    reporteId: input.reporteId,
    creadorId: input.creadorId,
    usuarioActualId: input.usuarioActualId,
    usuariosQueConfirmaron: input.usuariosQueConfirmaron,
  });

  const supabase = obtenerClienteSupabase();

  if (!supabase) {
    throw new ErrorConfiguracionSupabase(mensajeConfiguracionSupabase());
  }

  const ejecutarConfirmarReporte = supabase.rpc as unknown as (
    funcion: 'confirmar_reporte',
    args: Database['public']['Functions']['confirmar_reporte']['Args'],
  ) => RespuestaRpc<string>;

  const { data, error } = await ejecutarConfirmarReporte('confirmar_reporte', {
    p_reporte_id: input.reporteId,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('El servidor no devolvió la confirmación del reporte.');
  }

  return data;
}
