"use client";

import Form from "next/form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FriendFilters } from "../schema";

const GENDER_OPTIONS = [
  { value: "", label: "전체" },
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];

export function FriendFilter({ filters }: { filters: FriendFilters }) {
  const hasFilter = !!(filters.gender || filters.from || filters.to);
  // 필터가 바뀌면 입력값을 URL 기준으로 다시 맞추기 위해 key를 바꾼다.
  const formKey = `${filters.gender ?? ""}-${filters.from ?? ""}-${filters.to ?? ""}`;

  return (
    <Form key={formKey} action="/friends" className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-2">
        <Label>성별</Label>
        <div className="flex gap-4">
          {GENDER_OPTIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="gender"
                value={o.value}
                defaultChecked={(filters.gender ?? "") === o.value}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="from">출생연도</Label>
        <div className="flex items-center gap-2">
          <Input
            id="from"
            name="from"
            type="number"
            inputMode="numeric"
            placeholder="시작 (예: 1994)"
            defaultValue={filters.from}
          />
          <span className="text-sm text-muted-foreground">~</span>
          <Input
            name="to"
            type="number"
            inputMode="numeric"
            placeholder="끝 (예: 1998)"
            defaultValue={filters.to}
            aria-label="출생연도 끝"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">검색</Button>
        {hasFilter && (
          <Button variant="outline" nativeButton={false} render={<Link href="/friends" />}>
            초기화
          </Button>
        )}
      </div>
    </Form>
  );
}
