"use client";

import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import type { FriendWithImage } from "../types";
import { FriendProfile } from "./friend-profile";

// 꽉 찬 화면 상세 보기. 닫기는 history.back()으로 하고, 기기 뒤로가기와 같은 경로(popstate)로 처리한다.
export function FriendDetailModal({ friend }: { friend: FriendWithImage }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${friend.name} 프로필`}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-2 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="sticky top-0 z-10 -mx-4 bg-background px-4 pt-[env(safe-area-inset-top)]">
          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label="목록으로 돌아가기"
            className="-ml-3 flex size-11 items-center justify-center"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
        </div>
        <FriendProfile friend={friend} />
      </div>
    </div>
  );
}
