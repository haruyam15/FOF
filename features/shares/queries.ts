import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { IMAGE_BUCKET } from "@/features/friends/fields";
import type { Friend, FriendWithImage } from "@/features/friends/types";

const IMAGE_URL_TTL_SEC = 60 * 60;

// 유효한(만료·취소되지 않은) 토큰의 친구 프로필 한 명만 돌려준다. 그 외에는 null.
// 토큰 외의 어떤 값으로도 다른 친구를 조회할 수 없다.
export async function getSharedFriend(token: string): Promise<FriendWithImage | null> {
  // 토큰 형식이 아니면 DB를 조회하지 않는다.
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) return null;

  const supabase = createAdminClient();
  const { data: share, error } = await supabase
    .from("friend_shares")
    .select("friend_id")
    .eq("token", token)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error(`공유 링크를 확인하지 못했습니다: ${error.message}`);
  if (!share) return null;

  const { data, error: friendError } = await supabase
    .from("friends")
    .select("*")
    .eq("id", share.friend_id)
    .maybeSingle();
  if (friendError) throw new Error(`친구 정보를 불러오지 못했습니다: ${friendError.message}`);
  const friend = data as Friend | null;
  if (!friend) return null;

  let imageUrl: string | null = null;
  if (friend.image_path) {
    const { data } = await supabase.storage
      .from(IMAGE_BUCKET)
      .createSignedUrl(friend.image_path, IMAGE_URL_TTL_SEC);
    imageUrl = data?.signedUrl ?? null;
  }
  return { ...friend, imageUrl };
}
