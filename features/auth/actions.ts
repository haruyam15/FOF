"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SEC } from "@/lib/auth/token";

export type LoginState = { error?: string };

const FAIL_DELAY_MS = 1000;

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// MVP 임시 로그인: 공용 비밀번호(ADMIN_PASSWORD) 하나. Phase 2에서 Supabase Auth로 교체한다.
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!password || !secret) {
    return { error: "서버 설정(ADMIN_PASSWORD, AUTH_SECRET)이 필요해요." };
  }

  const input = formData.get("password");
  if (typeof input !== "string" || !safeEqual(input, password)) {
    // 대입 공격을 늦추기 위한 지연
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
    return { error: "비밀번호가 맞지 않아요." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
  redirect("/friends");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
