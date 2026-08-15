import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * true, wenn beide Umgebungsvariablen gesetzt sind.
 * App.tsx nutzt dieses Flag, um bei fehlender Konfiguration einen
 * klaren Warnhinweis statt eines Absturzes anzuzeigen.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Fallback-Werte verhindern, dass createClient() selbst wirft, solange
// isSupabaseConfigured von der App korrekt geprüft wird, bevor Supabase
// tatsächlich verwendet wird.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
