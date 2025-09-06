'use client';
import Link from "next/link";
import { useRouter } from 'next/navigation';

// ヘッダーとログイン画面
export default function Page() {
  const router = useRouter();
  return (
    <div className="min-h-dvh flex flex-col">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-300 shadow-sm bg-white/70 backdrop-blur-sm">
        <div className="flex">
          <h1 className="text-2xl font-bold">CtrlWin</h1>
        </div>
      </header>

      {/* ログインフォーム */}
      <div className="min-h-screen flex flex-col bg-rose-50">
        <main className="flex-1 grid place-items-center  p-4">
          <section
            aria-labelledby="login-title"
            className="w-full max-w-sm rounded-xl border bg-white p-6 shadow"
          >
            <div className="mb-4 text-xl font-semibold">ログイン</div>
            <label htmlFor="username" className="block text-sm font-medium">
              ユーザー名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-gray-1000 bg-white px-3 py-2
             outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <label
              htmlFor="password"
              className="mt-4 block text-sm font-medium"
            >
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-gray-1000 bg-white px-3 py-2
             outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {/* 送信ボタン */}
            
            <div className="mt-6">
              <button
                type="button"  // ← submit にしない
                onClick={() => router.push('/dashboard')}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                送信
              </button>
            </div>

            {/* アカウント作成リンク */}
            <p className="mt-3 text-center text-sm text-neutral-600">
              アカウントをお持ちでない方は
              <Link
                href="/dashboard/login"
                className="ml-1 font-medium text-blue-600 underline underline-offset-4
               hover:text-blue-700 focus-visible:outline-none
               focus-visible:ring-2 focus-visible:ring-blue-300 rounded-sm"
              >
                こちら
              </Link>
            </p>

          </section>
        </main>
      </div>
    </div>
  );
}