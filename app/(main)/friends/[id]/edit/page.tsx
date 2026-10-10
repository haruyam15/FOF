import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/common/page-title";
import { FriendForm } from "@/features/friends/components/friend-form";
import { getFriendById } from "@/features/friends/queries";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "친구 수정 | FOF" };

export default async function EditFriendPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const friend = await getFriendById(id);
  if (!friend) notFound();

  return (
    <>
      <PageTitle>친구 수정</PageTitle>
      <FriendForm friend={friend} />
    </>
  );
}
