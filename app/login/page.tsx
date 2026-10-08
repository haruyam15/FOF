import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "로그인 | FOF",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAdmin()) redirect("/friends");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <Image src="/logo.png" alt="FOF" width={512} height={196} priority className="h-12 w-auto self-center" />
      <LoginForm />
    </main>
  );
}
