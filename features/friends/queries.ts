import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { IMAGE_BUCKET } from "./fields";
import type { Friend, FriendWithImage } from "./types";

export const FRIENDS_CACHE_TAG = "friends";

// 서명 URL이 캐시 기간 동안 항상 유효하도록, 캐시 TTL(30분)보다 URL 유효기간(2시간)을 길게 잡는다.
const CACHE_TTL_SEC = 30 * 60;
const SIGNED_URL_TTL_SEC = 2 * 60 * 60;

// 목록 전체(최대 ~100명)를 한 번에 가져온다. 필터는 클라이언트에서 처리한다.
// 결과를 캐시해 서명 URL이 요청마다 바뀌지 않게 한다 → 브라우저/이미지 최적화 캐시가 적중한다.
export const getFriends = unstable_cache(fetchFriends, ["friends-list"], {
  revalidate: CACHE_TTL_SEC,
  tags: [FRIENDS_CACHE_TAG],
});

async function fetchFriends(): Promise<FriendWithImage[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .order("created_at", { ascending: false }).overrideTypes<Friend[], { merge: false }>();
  if (error) throw new Error(`친구 목록을 불러오지 못했습니다: ${error.message}`);

  const paths = data.flatMap((f) => (f.image_path ? [f.image_path] : []));
  const urlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from(IMAGE_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL_SEC);
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl) urlByPath.set(item.path, item.signedUrl);
    }
  }

  return data.map((f) => ({
    ...f,
    imageUrl: f.image_path ? (urlByPath.get(f.image_path) ?? null) : null,
  }));
}
