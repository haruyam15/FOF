"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createShareLink } from "../actions";

const SHARE_MESSAGE = "소개해 드릴 친구에요.";

type Status = "idle" | "copied" | "error";

// 모바일에서는 공유 시트(카카오톡 포함)를 열고, 지원하지 않으면 링크를 복사한다.
export function ShareButton({ friendId, friendName }: { friendId: string; friendName: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>("idle");

  function handleClick() {
    startTransition(async () => {
      const result = await createShareLink(friendId);
      if ("error" in result) {
        setStatus("error");
        return;
      }
      // 앱마다 text와 url을 합치는 방식이 달라, 줄바꿈이 보장되도록 본문에 링크까지 넣는다.
      // 이름은 메시지에 넣지 않는다.
      const message = `${SHARE_MESSAGE}\n${result.url}`;
      try {
        if (navigator.share) {
          await navigator.share({ text: message });
          setStatus("idle");
        } else {
          await navigator.clipboard.writeText(message);
          setStatus("copied");
        }
      } catch (e) {
        // 사용자가 공유 시트를 닫은 경우는 오류가 아니다.
        if (e instanceof DOMException && e.name === "AbortError") return;
        setStatus("error");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      // 보이는 크기는 작게, 터치 영역은 44px 이상으로 넓힌다.
      className="relative after:absolute after:-inset-2.5 after:content-['']"
      disabled={pending}
      onClick={handleClick}
      aria-label={`${friendName} 프로필 공유`}
    >
      {pending
        ? "링크 만드는 중..."
        : status === "copied"
          ? "링크가 복사됐어요"
          : status === "error"
            ? "다시 시도"
            : "공유"}
    </Button>
  );
}
