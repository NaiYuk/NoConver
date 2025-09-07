// src/app/page.tsx
'use client';

import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name || !pass) {
      setErr("ユーザー名とパスワードは必須です");
      return;
    }
    try {
      setLoading(true);
      // ★ NextAuth(Credentials) に合わせて name/pass を送る（redirect:falseで手動遷移）
      const res = await signIn("credentials", {
        redirect: false,
        name,
        pass,
      });
      if (!res || res.error) {
        // ここに来るのは認証失敗（ユーザーなし or パス不一致 など）
        throw new Error(res?.error ?? "ログインに失敗しました");
      }
      // 認証OK → ダッシュボードへ
      router.replace("/dashboard");
    } catch (e: any) {
      setErr(e.message ?? "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <AppHeader />

      <div className="min-h-screen flex flex-col bg-rose-50">
        <main className="flex-1 grid place-items-center p-4">
          <section
            aria-labelledby="login-title"
            className="w-full max-w-sm rounded-xl border bg-white p-6 shadow"
          >
            <h1 id="login-title" className="mb-4 text-xl font-semibold">
              ログイン
            </h1>

            <form onSubmit={onSubmit} className="space-y-3">
              <label htmlFor="username" className="block text-sm font-medium">
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="username"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              <label htmlFor="password" className="block text-sm font-medium mt-2">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              {err && <p className="text-sm text-red-600">{err}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                >
                  {loading ? "認証中…" : "送信"}
                </button>
              </div>
            </form>

            <p className="mt-3 text-center text-sm text-neutral-600">
              アカウントをお持ちでない方は
              <Link
                href="/dashboard/register"
                className="ml-1 font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700"
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