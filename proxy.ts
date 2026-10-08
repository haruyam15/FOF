import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

// 로그인 없이 열 수 있는 경로: 로그인 화면, 공유 링크(토큰으로 보호됨)
const PUBLIC_PATHS = ["/login", "/s/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login" || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const ok = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    process.env.AUTH_SECRET,
  );
  if (ok) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // 정적 파일(확장자 있는 경로), _next, PWA manifest/아이콘은 제외
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
