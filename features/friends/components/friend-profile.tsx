import Image from "next/image";
import { FALLBACK_AVATAR, genderLabel } from "../fields";
import type { FriendWithImage } from "../types";

// 프로필 카드. 공유 링크 화면과 목록의 상세 보기에서 같이 쓴다. 링크·이동 수단을 두지 않는다.
export function FriendProfile({ friend }: { friend: FriendWithImage }) {
  const rows = [
    ["직업", friend.job],
    ["거주지", friend.residence],
    ["종교", friend.religion],
    ["성격", friend.personality],
    ["이상형", friend.ideal_type],
  ].filter((r): r is [string, string] => Boolean(r[1]));

  return (
    <article className="overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10">
      <div className="relative aspect-square w-full bg-muted">
        <Image
          src={friend.imageUrl ?? FALLBACK_AVATAR}
          alt={friend.imageUrl ? `${friend.name} 사진` : `${friend.name} 기본 프로필 이미지`}
          fill
          priority
          sizes="(max-width: 448px) 100vw, 448px"
          unoptimized={!friend.imageUrl}
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div>
          <h1 className="text-xl font-semibold">{friend.name}</h1>
          <p className="text-sm text-muted-foreground">
            {genderLabel(friend.gender)} · {friend.birth_year}년생 · {friend.height_cm}cm
          </p>
        </div>
        <dl className="flex flex-col gap-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="whitespace-pre-wrap">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
