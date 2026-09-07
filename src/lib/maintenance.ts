import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Short-lived in-memory cache so the maintenance flag does not trigger a
// database query on every single request (important under heavy traffic).
const TTL_MS = 30_000;

let cache: { value: boolean; at: number } | null = null;

export async function isMaintenanceEnabled(): Promise<boolean> {
  // Env flag is the source of truth when set (instant, works even if the DB is down).
  const env = process.env.MAINTENANCE_MODE;
  if (env === "true" || env === "1" || env === "on") return true;

  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  let enabled = false;
  if (isSupabaseConfigured) {
    try {
      const { data } = await getServerClient()
        .from("settings")
        .select("maintenance_mode")
        .eq("id", 1)
        .maybeSingle();
      enabled = Boolean(data?.maintenance_mode);
    } catch {
      enabled = false;
    }
  }
  cache = { value: enabled, at: Date.now() };
  return enabled;
}

export function clearMaintenanceCache() {
  cache = null;
}