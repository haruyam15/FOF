import type { NextConfig } from "next";

const supabaseHost = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // 친구 사진은 Supabase Storage 서명 URL → Next 이미지 최적화(리사이즈·캐시)를 거친다.
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/sign/**" }]
      : [],
    // 카드 썸네일(96px, 2~3x)만 쓴다.
    imageSizes: [96, 192, 288],
    deviceSizes: [640, 750, 828],
  },
  /* config options here */
  experimental: {
    serverActions: {
      // 친구 이미지 최대 5MB + multipart 오버헤드
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
