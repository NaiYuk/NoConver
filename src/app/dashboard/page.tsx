"use client";
import Image from "next/image";

import { query } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import AddProject from "@/components/forms/AddProject";

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

      {/* メイン */}
      <main className="flex flex-1 justify-center items-center">
        <div className="relative flex flex-col gap-8 w-full max-w-5xl px-6">

          {/* オーバーレイ（必要な時だけ描画） */}
          {open && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              {/* 白いカード */}
              <div className="relative z-30 w-full max-w-md rounded-xl border bg-white p-6 shadow-2xl">
                <button
                  className="absolute right-3 top-3 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={closeOverlay}
                >
                  ✕
                </button>

                {mode === "menu" ? (
                  <>
                    <h2 className="mb-4 text-lg font-semibold">参加方法を選択</h2>
                    <div className="grid gap-3">
                      <Link
                        href="/dashboard/roomjoin"
                        className="block w-full py-4 rounded-lg bg-blue-600 text-center text-white"
                      >
                        一覧を見る
                      </Link>
                      <button
                        type="button"
                        onClick={() => setMode("manual")}
                        className="w-full py-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        部屋IDとパスワードを入力する
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="mb-4 text-lg font-semibold">部屋IDで参加</h2>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700">部屋ID</span>
                        <input
                          type="text"
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value)}
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="例: 123456"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700">パスワード</span>
                        <input
                          type="password"
                          value={roomPass}
                          onChange={(e) => setRoomPass(e.target.value)}
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="パスワードを入力"
                          required
                        />
                      </label>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setMode("menu")}
                          className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                        >
                          ← 戻る
                        </button>
                        <button
                          type="submit"
                          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                          参加する
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 議題の作成と参加のボタン */}
          <Link
            href="/dashboard/addproject"
            className="block w-full py-6 text-2xl rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-center"
          >
            議題を作成
          </Link>

          <button
            type="button"
            onClick={() => { setMode("menu"); setOpen(true); }}  // 開く時に必ず menu から
            className="w-full py-6 text-2xl rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            議題に参加
          </button>
        </div>
      </main>
    </div>
  );
}
