'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { FALLBACK_AVATAR } from '../fields';

// 좌우로 스와이프해 넘겨 보는 사진 영역. CSS scroll-snap으로 구현하고, 2장 이상일 때만 위치 점을 보여준다.
export function ImageCarousel({ urls, name }: { urls: string[]; name: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  if (urls.length === 0) {
    return (
      <div className="relative aspect-square w-full bg-muted">
        <Image
          src={FALLBACK_AVATAR}
          alt={`${name} 기본 프로필 이미지`}
          fill
          priority
          unoptimized
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover"
        />
      </div>
    );
  }

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative aspect-square w-full bg-muted">
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {urls.map((url, i) => (
          <li key={url} className="relative size-full shrink-0 snap-center">
            <Image
              src={url}
              alt={`${name} 사진 ${i + 1}/${urls.length}`}
              fill
              priority={i === 0}
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      {urls.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
          {urls.map((url, i) => (
            <span
              key={url}
              className={cn('size-1.5 rounded-full bg-background/60', i === index && 'bg-background')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
