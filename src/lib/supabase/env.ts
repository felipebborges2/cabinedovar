export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      isConfigured: false,
      url: "http://127.0.0.1:54321",
      anonKey: "missing-anon-key",
    };
  }

  return { isConfigured: true, url, anonKey };
}
