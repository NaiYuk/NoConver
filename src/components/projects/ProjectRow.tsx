// components/projects/ProjectRow.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type Project = {
  project_id: number;
  title: string;
  owner_id: number;
  owner_name?: string;
  status: "意見収集中" | "投票中" | "可決済";
  list_id: string;
  create_at?: string; 
};

export default function ProjectRow({ p, onStatusChanged }: {
  p: Project;
  onStatusChanged: (projectId: number, next: Project["status"]) => void;
}) {
  const { data: session } = useSession();
  const myId = Number(session?.user?.id);
  const isOwner = myId === p.owner_id;

  const [loading, setLoading] = useState<"vote" | "approve" | null>(null);

  const toVoting = async () => {
    try {
      setLoading("vote");
      // 事前ガード（UI側）
      if (!isOwner || p.status !== "意見収集中") return;

      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: p.project_id, next: "投票中" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error ?? "更新失敗");

      onStatusChanged(p.project_id, "投票中"); // 楽観更新
    } catch (e: any) {
      alert(e.message ?? "更新に失敗しました");
    } finally {
      setLoading(null);
    }
  };

  const toApproved = async () => {
    try {
      setLoading("approve");
      if (!isOwner || p.status !== "投票中") return;

      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: p.project_id, next: "可決済" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error ?? "更新失敗");

      onStatusChanged(p.project_id, "可決済");
    } catch (e: any) {
      alert(e.message ?? "更新に失敗しました");
    } finally {
      setLoading(null);
    }
  };

  const disableVote   = !isOwner || p.status !== "意見収集中" || !!loading;
  const disableApprove= !isOwner || p.status !== "投票中"     || !!loading;

  return (
    <div className="flex flex-col gap-2 px-6 py-5 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition cursor-pointer shadow-sm">
      <div className="min-w-0">
        <div className="font-semibold truncate">{p.title}</div>
        <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-4">
          ID: <span className="font-mono">{p.list_id}</span>
          {p.owner_name ? ` 作成者: ${p.owner_name}` : ""}
          {isOwner ? "(あなたが作成者です)" : ""}
          <span>{p.create_at ? ` 作成日時: ${new Date(p.create_at).toLocaleString()}` : ""}</span>
        </div>
      </div>
      <hr />
      <div className="flex items-center gap-3 pt-2">
        {/* アクションボタン */}
        <div className="flex gap-2">
          <button
            onClick={toVoting}
            disabled={disableVote}
            className={`rounded-md px-3 py-2 text-sm ${
              disableVote
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {loading === "vote" ? "更新中…" : "投票開始"}
          </button>

          <button
            onClick={toApproved}
            disabled={disableApprove}
            className={`rounded-md px-3 py-2 text-sm ${
              disableApprove
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {loading === "approve" ? "更新中…" : "可決にする"}
          </button>
        </div>

        {/* ステータスバッジ */}
        <span
          className={`ml-auto text-xs font-large font-bold px-4 py-3 rounded-full ${
            p.status === "意見収集中"
              ? "bg-yellow-100 text-yellow-800"
              : p.status === "投票中"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {p.status}
        </span>
      </div>
    </div>
  );
}