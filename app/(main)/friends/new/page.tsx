import type { Metadata } from "next";
import { FriendForm } from "@/features/friends/components/friend-form";

export const metadata: Metadata = { title: "친구 등록 | FOF" };

export default function NewFriendPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">친구 등록</h1>
      <FriendForm />
    </>
  );
}
