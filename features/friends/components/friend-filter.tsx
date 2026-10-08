import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FriendFilters } from "../schema";

const GENDER_OPTIONS = [
  { value: undefined, label: "전체", href: "/friends" },
  { value: "male", label: "남성", href: "/friends?gender=male" },
  { value: "female", label: "여성", href: "/friends?gender=female" },
] as const;

export function FriendFilter({ filters }: { filters: FriendFilters }) {
  return (
    <nav aria-label="성별 필터" className="flex gap-2">
      {GENDER_OPTIONS.map((o) => {
        const active = filters.gender === o.value;
        return (
          <Link
            key={o.label}
            href={o.href}
            aria-current={active ? "true" : undefined}
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-4 text-sm",
              active ? "border-brand bg-brand/20 font-medium" : "text-muted-foreground",
            )}
          >
            {o.label}
          </Link>
        );
      })}
    </nav>
  );
}
