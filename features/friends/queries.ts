import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { signImagePaths, urlsForPaths } from "./images";
import type { Friend, FriendForEdit, FriendWithImage } from "./types";

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

  const urlByPath = await signImagePaths(
    supabase,
    data.flatMap((f) => f.image_paths),
    SIGNED_URL_TTL_SEC,
  );

  return data.map((f) => ({ ...f, imageUrls: urlsForPaths(f.image_paths, urlByPath) }));
}

// 수정 화면용 단건 조회. 캐시하지 않는다(수정 직전의 최신 값이 필요).
export async function getFriendById(id: string): Promise<FriendForEdit | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .eq("id", id)
    .maybeSingle<Friend>();
  if (error) throw new Error(`친구 정보를 불러오지 못했습니다: ${error.message}`);
  if (!data) return null;

  const urlByPath = await signImagePaths(supabase, data.image_paths, SIGNED_URL_TTL_SEC);
  // 수정 화면은 유지/삭제할 사진을 경로로 구분해야 하므로 [경로, URL] 쌍으로 넘긴다.
  const images = data.image_paths.flatMap((path) => {
    const url = urlByPath.get(path);
    return url ? [{ path, url }] : [];
  });
  return { ...data, imageUrls: urlsForPaths(data.image_paths, urlByPath), images };
}
