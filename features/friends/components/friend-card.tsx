import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { genderLabel } from "../fields";
import type { FriendWithImage } from "../types";

export function FriendCard({ friend }: { friend: FriendWithImage }) {
  return (
    <Card>
      <CardContent className="flex gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
          {friend.imageUrl ? (
            <Image
              src={friend.imageUrl}
              alt={`${friend.name} 사진`}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-2xl text-muted-foreground">
              {friend.name.slice(0, 1)}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-1">
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
    </Card>
  );
}
