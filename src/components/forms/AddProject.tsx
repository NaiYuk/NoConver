// src/components/forms/AddProject.tsx
'use client';

import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";

type ProjectStatus = "意見収集中" | "投票中" | "可決済";

function genListId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function AddProject() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [pass, setPass] = useState("");
  const [listId, setListId] = useState("");
  const [creating, setCreating] = useState(false);

  // 作成後に画面内で使う情報
  const [projectId, setProjectId] = useState<number | null>(null);
  const [status, setStatus] = useState<ProjectStatus>("意見収集中");
  const [updating, setUpdating] = useState<"vote" | "approve" | null>(null);

  useEffect(() => {
    setListId(genListId()); // フォーム表示時に生成（DB登録は送信時）
  }, []);

  const canVote = projectId !== null && status === "意見収集中" && !updating;
  const canApprove = projectId !== null && status === "投票中" && !updating;

  const btnClass = (enabled: boolean, color: "indigo" | "green") =>
    enabled
      ? `rounded-md px-4 py-2 text-white bg-${color}-600 hover:bg-${color}-700 transition`
      : "rounded-md px-4 py-2 bg-gray-200 text-gray-500 cursor-not-allowed";

  // 作成
  const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!title || !pass || !listId) {
    alert("タイトル/パスワード/IDが不足しています");
    return;
  }

  try {
    setCreating(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, pass, list_id: listId }),
    });

    // ★ ここがポイント：ボディは1回だけ読む
    const bodyText = await res.text();
    let data: any = null;
    try {
      data = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      // JSONでなければ data は null のまま
    }

    if (!res.ok || !data?.success) {
      const msg = data?.error || bodyText || `作成失敗 (${res.status})`;
      throw new Error(msg);
    }

    // 成功
    setProjectId(data.project_id);
    setStatus("意見収集中");
    alert(`議題ID: ${data.list_id} で作成しました`);

    setTitle("");
    setPass("");
    setListId(genListId()); // 次回作成用
    router.push("/dashboard/selectProject"); 
  } catch (err: any) {
    alert(err?.message ?? "通信エラー");
  } finally {
    setCreating(false);
  }
};

  // 投票開始
  const toVoting = async () => {
    if (!projectId) return;
    try {
      setUpdating("vote");
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, next: "投票中" }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error ?? "更新に失敗しました");
      setStatus("投票中"); // 楽観更新
    } catch (e: any) {
      alert(e.message ?? "通信エラー");
    } finally {
      setUpdating(null);
    }
  };

  // 可決
  const toApproved = async () => {
    if (!projectId) return;
    try {
      setUpdating("approve");
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, next: "可決済" }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error ?? "更新に失敗しました");
      setStatus("可決済");
    } catch (e: any) {
      alert(e.message ?? "通信エラー");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
      <main className="flex flex-1 justify-center items-center w-full p-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border overflow-hidden">
          <section className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-700">
                議題ID: <span className="font-mono">{projectId ? listId : (listId || "-----")}</span>
              </h2>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  status === "意見収集中"
                    ? "bg-amber-100 text-amber-700"
                    : status === "投票中"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {status}
              </span>
            </div>

            {/* 作成フォーム */}
            <form className="flex flex-col gap-4" onSubmit={handleCreate}>
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                  議題名
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="例: 次期プロジェクト管理ツールを何にするか？"
                  required
                />
              </div>

              <div>
                <label htmlFor="pass" className="block text-sm font-medium text-gray-700">
                  議題パスワード
                </label>
                <input
                  type="password"
                  id="pass"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="パスワードを設定する..."
                  required
                />
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={creating || !listId || !title || !pass}
                  className={`w-full ${creating ? "opacity-60" : ""} rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50`}
                >
                  {creating ? "作成中…" : "議題を追加"}
                </button>
              </div>
            </form>

            {/* ステータス操作（作成後のみ表示） */}
            {projectId && (
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={toVoting}
                  disabled={!canVote}
                  className={btnClass(canVote, "indigo")}
                >
                  {updating === "vote" ? "更新中…" : "投票開始"}
                </button>

                <button
                  type="button"
                  onClick={toApproved}
                  disabled={!canApprove}
                  className={btnClass(canApprove, "green")}
                >
                  {updating === "approve" ? "更新中…" : "可決にする"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}