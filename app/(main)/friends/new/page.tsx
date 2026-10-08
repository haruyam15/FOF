import type { Metadata } from "next";
import { PageTitle } from "@/components/common/page-title";
import { FriendForm } from "@/features/friends/components/friend-form";

export const metadata: Metadata = { title: "친구 등록 | FOF" };

export default function NewFriendPage() {
  return (
    <>
      <PageTitle>친구 등록</PageTitle>
      <FriendForm />
    </>
  );
}
