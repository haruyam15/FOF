import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageTitle } from "@/components/common/page-title";
import { buttonVariants } from "@/components/ui/button";
import { FriendList } from "@/features/friends/components/friend-list";
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
      <PageTitle
        action={
          <Link href="/friends/new" className={buttonVariants()}>
            친구 등록
          </Link>
        }
      >
        친구 목록
      </PageTitle>
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
  const initialFilters = parseFilters(await searchParams);
  const friends = await getFriends();

  return <FriendList friends={friends} initialFilters={initialFilters} />;
}
