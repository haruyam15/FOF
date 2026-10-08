import Link from "next/link";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <Link href="/friends" className="text-lg font-semibold">
          FOF
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/friends">친구 목록</Link>
          <Link href="/friends/new">친구 등록</Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-6">{children}</main>
    </div>
  );
}
