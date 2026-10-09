import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

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
      // En web, supabase-js usa localStorage por defecto; AsyncStorage solo aplica a nativo.
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return cliente;
}
