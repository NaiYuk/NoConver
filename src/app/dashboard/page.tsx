import Image from "next/image";
import { query } from "@/lib/db";
import AppHeader from "@/components/AppHeader";

export default async function Home() {
  const userId = 1; 

  const rows = await query<{ name: string }>(
    "SELECT name FROM users WHERE id = ?",
    [userId]
  );
  const userName = rows[0]?.name ?? "ゲスト";

  
  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
      {/* ヘッダー */}
      <AppHeader />

      {/* 中央のボタン */}
      <main className="flex flex-1 justify-center items-center">
        <div className="flex flex-col gap-6 md:gap-12 lg:gap-20 w-full max-w-5xl px-6">
          <button className="w-full py-6 text-2xl rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            議題を作成
          </button>
          <button className="w-full py-6 text-2xl rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
            議題に参加
          </button>
        </div>
      </main>
    </div>
  );
}
