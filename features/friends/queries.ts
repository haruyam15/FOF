import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { IMAGE_BUCKET } from "./fields";
import type { FriendFilters } from "./schema";
import type { Friend, FriendWithImage } from "./types";

const SIGNED_URL_TTL_SEC = 60 * 60;

export async function getFriends(filters: FriendFilters): Promise<FriendWithImage[]> {
  const supabase = createAdminClient();

  let query = supabase.from("friends").select("*").order("created_at", { ascending: false });
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.from !== undefined) query = query.gte("birth_year", filters.from);
  if (filters.to !== undefined) query = query.lte("birth_year", filters.to);

  const { data, error } = await query.overrideTypes<Friend[], { merge: false }>();
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
