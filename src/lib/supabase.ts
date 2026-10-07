import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/src/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseConfigurado() {
  return Boolean(supabaseUrl) && Boolean(supabaseAnonKey);
}

export function mensajeConfiguracionSupabase() {
  return 'Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY para habilitar datos en línea.';
}

let cliente: SupabaseClient<Database> | null = null;

export function obtenerClienteSupabase() {
  if (!supabaseConfigurado()) {
    return null;
  }

  if (cliente) {
    return cliente;
  }

  cliente = createClient<Database>(supabaseUrl ?? '', supabaseAnonKey ?? '', {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return cliente;
}
