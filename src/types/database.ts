export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type EstadoReporte =
  | 'no_confirmada'
  | 'verificada'
  | 'rechazada'
  | 'resuelta'
  | 'manual_verificada';

export type Database = {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          activa: boolean;
          color: string | null;
          icono: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          activa?: boolean;
          color?: string | null;
          icono?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nombre?: string;
          descripcion?: string | null;
          activa?: boolean;
          color?: string | null;
          icono?: string | null;
          updated_at?: string;
        };
      };
      reportes: {
        Row: {
          id: string;
          categoria_id: string;
          creador_id: string;
          estado: EstadoReporte;
          descripcion: string | null;
          latitud_aproximada: number;
          longitud_aproximada: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          categoria_id: string;
          creador_id: string;
          estado?: EstadoReporte;
          descripcion?: string | null;
          latitud_aproximada?: number;
          longitud_aproximada?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          categoria_id?: string;
          estado?: EstadoReporte;
          descripcion?: string | null;
          latitud_aproximada?: number;
          longitud_aproximada?: number;
          updated_at?: string;
        };
      };
    };
    Views: {
      reportes_publicos: {
        Row: {
          id: string;
          categoria_id: string;
          categoria_nombre: string;
          estado: EstadoReporte;
          latitud_aproximada: number;
          longitud_aproximada: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      crear_reporte: {
        Args: {
          p_categoria_id: string;
          p_latitud: number;
          p_longitud: number;
          p_descripcion?: string | null;
        };
        Returns: string;
      };
      confirmar_reporte: {
        Args: {
          p_reporte_id: string;
        };
        Returns: string;
      };
      evaluar_proximidad_para_verificacion: {
        Args: {
          p_reporte_id: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      estado_reporte: EstadoReporte;
    };
    CompositeTypes: {
      [_: string]: never;
    };
  };
};
