import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { IMAGE_BUCKET } from "./fields";

// Storage 경로들을 서명 URL로 바꿔 [경로 → URL] 맵으로 돌려준다. (한 번의 요청으로 처리)
export async function signImagePaths(
  supabase: SupabaseClient,
  paths: string[],
  ttlSec: number,
): Promise<Map<string, string>> {
  const urlByPath = new Map<string, string>();
  if (paths.length === 0) return urlByPath;
  const { data } = await supabase.storage.from(IMAGE_BUCKET).createSignedUrls(paths, ttlSec);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) urlByPath.set(item.path, item.signedUrl);
  }
  return urlByPath;
}

// 저장 순서를 유지하며, 서명에 실패한 경로는 건너뛴다.
export function urlsForPaths(paths: string[], urlByPath: Map<string, string>): string[] {
  return paths.flatMap((p) => {
    const url = urlByPath.get(p);
    return url ? [url] : [];
  });
}
