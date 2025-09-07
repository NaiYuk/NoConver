// 例: src/app/dashboard/page.tsx
import Link from "next/link";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) return redirect("/dashboard/login");

  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
      <AppHeader />
      <main className="flex flex-1 justify-center items-center">
        <div className="flex flex-col gap-6 md:gap-12 lg:gap-20 w-full max-w-5xl px-6">
          <Link
            href="/dashboard/createProject"
            className="w-full text-center py-6 text-2xl rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            議題を作成
          </Link>
          <Link
            href="/dashboard/selectProject"
            className="w-full text-center py-6 text-2xl rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            議題に参加
          </Link>
        </div>
      </main>
    </div>
  );
}
