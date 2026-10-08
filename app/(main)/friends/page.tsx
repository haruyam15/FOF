import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { FriendCard } from "@/features/friends/components/friend-card";
import { FriendFilter } from "@/features/friends/components/friend-filter";
import { getFriends } from "@/features/friends/queries";
import { parseFilters } from "@/features/friends/schema";

export const metadata: Metadata = { title: "친구 목록 | FOF" };

export default function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">친구 목록</h1>
        <Link href="/friends/new" className={buttonVariants()}>
          친구 등록
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}>
        <FriendListSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function FriendListSection({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const friends = await getFriends(filters);

  return (
    <>
      <FriendFilter filters={filters} />
      <p className="text-sm text-muted-foreground">총 {friends.length}명</p>
      {friends.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          조건에 맞는 친구가 없어요.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {friends.map((f) => (
            <li key={f.id}>
              <FriendCard friend={f} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
