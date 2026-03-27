let supabase = null;

function initializeSupabase() {
  const { supabaseUrl, supabaseAnonKey } = APP_CONFIG;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase não configurado");
    return null;
  }

  supabase = window.supabase.createClient(
    supabaseUrl,
    supabaseAnonKey
  );

  return supabase;
}

initializeSupabase();