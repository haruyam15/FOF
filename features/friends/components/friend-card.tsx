import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { FALLBACK_AVATAR, genderLabel } from "../fields";
import { ShareButton } from "@/features/shares/components/share-button";
import type { FriendWithImage } from "../types";

export function FriendCard({ friend, onOpen }: { friend: FriendWithImage; onOpen: () => void }) {
  return (
    <Card className="relative">
      <CardContent className="flex gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={friend.imageUrl ?? FALLBACK_AVATAR}
            alt={friend.imageUrl ? `${friend.name} 사진` : `${friend.name} 기본 프로필 이미지`}
            fill
            sizes="96px"
            unoptimized={!friend.imageUrl}
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1 pb-7">
          <p className="text-base font-medium">
            {friend.name}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {genderLabel(friend.gender)} · {friend.birth_year}년생 · {friend.height_cm}cm
            </span>
          </p>
          <p className="text-sm">
            {[friend.job, friend.residence].filter(Boolean).join(" · ")}
          </p>
          {friend.religion && (
            <p className="text-sm text-muted-foreground">종교: {friend.religion}</p>
          )}
          {friend.personality && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              성격: {friend.personality}
            </p>
          )}
          {friend.ideal_type && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              이상형: {friend.ideal_type}
            </p>
          )}

        </div>
      </CardContent>
      {/* 카드 전체를 누르면 상세 보기. 사진 래퍼(relative)가 위에 겹쳐 클릭을 가로채지 않도록 내용 뒤에 둔다. 공유 버튼은 이 위(z-10)에 따로 둔다. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${friend.name} 상세 보기`}
        className="absolute inset-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {/* 텍스트 길이와 상관없이 카드 우측 하단에 고정 */}
      <div className="absolute right-3 bottom-3 z-10">
        <ShareButton friendId={friend.id} friendName={friend.name} />
      </div>
    </Card>
  );
}
