import Image from "next/image";
import Link from "next/link";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:border-x">
      <header className="flex items-center justify-between">
        <Link href="/friends" aria-label="FOF 홈" className="flex h-11 items-center">
          <Image src="/logo.png" alt="FOF" width={512} height={196} priority className="h-8 w-auto" />
        </Link>
        <nav className="flex text-sm">
          <Link href="/friends" className="flex h-11 items-center px-3">
            친구 목록
          </Link>
          <Link href="/friends/new" className="flex h-11 items-center px-3">
            친구 등록
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-6">{children}</main>
    </div>
  );
}
