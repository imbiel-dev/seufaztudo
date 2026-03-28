(function initializeSupabase() {
  const { supabaseUrl, supabaseAnonKey } = APP_CONFIG;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase não configurado");
    return;
  }

  window.supabase = window.supabase.createClient(
    supabaseUrl,
    supabaseAnonKey
  );
})();