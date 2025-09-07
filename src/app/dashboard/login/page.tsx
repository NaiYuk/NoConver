'use client';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { useState } from "react";
import App from "next/app";
import AppHeader from "@/components/AppHeader";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleCreate = async () => {
    setErr(null);
    if (!name || !pass) { setErr("ユーザー名とパスワードは必須です"); return; }

    try {
      setLoading(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pass }), // ← APIへ渡す
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error ?? "登録に失敗しました");
      router.push("/dashboard");
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
          <section className="w-full max-w-sm rounded-xl border bg-white p-6 shadow">
            <div className="mb-4 text-xl font-semibold">新規作成</div>

            <label htmlFor="username" className="block text-sm font-medium">ユーザー名</label>
            <input
              id="username"
              name="username"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2
                         outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            <label htmlFor="password" className="mt-4 block text-sm font-medium">パスワード</label>
            <input
              id="password"
              name="password"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2
                         outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700
                           focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              >
                {loading ? "作成中..." : "作成"}
              </button>
            </div>

            <p className="mt-3 text-center text-sm text-neutral-600">
              アカウントをお持ちの方は
              <Link href="../" className="ml-1 font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700">
                こちら
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
