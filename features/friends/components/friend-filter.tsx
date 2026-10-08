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
    <div role="group" aria-label="성별 필터" className="flex gap-2">
      {GENDER_OPTIONS.map((o) => {
        const active = filters.gender === o.value;
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange({ gender: o.value })}
            className={cn(
              "inline-flex h-11 items-center rounded-full border px-4 text-sm",
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
