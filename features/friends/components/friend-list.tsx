"use client";

import { useState } from "react";
import type { FriendFilters } from "../schema";
import type { FriendWithImage } from "../types";
import { FriendCard } from "./friend-card";
import { FriendFilter } from "./friend-filter";

// 서버에서 받은 전체 목록을 클라이언트에서 필터링한다. (서버 왕복 없음)
export function FriendList({
  friends,
  initialFilters,
}: {
  friends: FriendWithImage[];
  initialFilters: FriendFilters;
}) {
  const [filters, setFilters] = useState(initialFilters);

  function handleChange(next: FriendFilters) {
    setFilters(next);
    // 새로고침·공유 시 필터가 유지되도록 URL만 갱신한다. (서버 요청 없음)
    window.history.replaceState(null, "", next.gender ? `?gender=${next.gender}` : "?");
  }

  const visible = filters.gender ? friends.filter((f) => f.gender === filters.gender) : friends;

  return (
    <>
      <FriendFilter filters={filters} onChange={handleChange} />
      <p className="text-sm text-muted-foreground">총 {visible.length}명</p>
      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          조건에 맞는 친구가 없어요.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((f) => (
            <li key={f.id}>
              <FriendCard friend={f} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
