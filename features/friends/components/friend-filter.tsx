"use client";

import { cn } from "@/lib/utils";
import type { FriendFilters } from "../schema";

const GENDER_OPTIONS = [
  { value: undefined, label: "전체" },
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
] as const;

export function FriendFilter({
  filters,
  onChange,
}: {
  filters: FriendFilters;
  onChange: (filters: FriendFilters) => void;
}) {
  return (
    <div role="group" aria-label="성별 필터" className="-mt-2 flex gap-2">
      {GENDER_OPTIONS.map((o) => {
        const active = filters.gender === o.value;
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange({ gender: o.value })}
            className={cn(
              "relative inline-flex h-9 items-center rounded-lg border px-3 text-sm after:absolute after:-inset-y-1 after:inset-x-0 after:content-['']",
              active ? "border-brand bg-brand/20 font-medium" : "text-muted-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
