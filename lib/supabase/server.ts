import "server-only";
import { createClient } from "@supabase/supabase-js";

// 서버 전용 클라이언트. service_role 키를 사용하므로 클라이언트 번들에 포함되면 안 된다.
export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
