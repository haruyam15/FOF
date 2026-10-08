'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// 스크롤해도 화면 상단에 고정되는 페이지 제목 영역. 고정된 상태에서만 은은한 그림자가 생긴다.
export function PageTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // 제목 영역 바로 위 센티널이 화면 밖으로 나가면 sticky로 붙은 상태로 본다.
  // (화면 경계에 닿기만 해도 intersecting으로 판단되므로 2px 띄워 둔다)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setStuck(!entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        'full-bleed sticky top-0 z-10 flex min-h-14 items-center justify-between bg-background py-2 transition-[filter]',
        stuck && 'drop-shadow-sticky',
      )}
    >
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none absolute -top-0.5 left-0 h-px w-full"
      />
      <h1 className="text-xl font-semibold">{children}</h1>
      {action}
    </div>
  );
}
