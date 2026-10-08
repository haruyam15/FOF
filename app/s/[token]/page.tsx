import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSharedFriend } from "@/features/shares/queries";
import { FriendProfile } from "@/features/friends/components/friend-profile";

// 링크 미리보기(카카오톡 등)에 개인정보가 남지 않도록 제목·설명은 고정 문구만 쓴다.
export const metadata: Metadata = {
  title: "FOF 친구 소개",
  description: "소개받은 친구의 프로필이에요.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function SharedProfilePage({ params }: PageProps<"/s/[token]">) {
  const { token } = await params;
  const friend = await getSharedFriend(token);
  if (!friend) notFound();

  return <FriendProfile friend={friend} />;
}
