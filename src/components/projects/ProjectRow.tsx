// components/projects/ProjectRow.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PasswordModal from "../PasswordModal";
type ProjectStatus = "意見収集中" | "投票中" | "可決済";

type Project = {
  project_id: number;
  title: string;
  owner_id: number;
  owner_name?: string;
  status: ProjectStatus;
  list_id: string;
  create_at?: string; 
};

export default function ProjectRow({ p, onStatusChanged }: {
  p: Project;
  onStatusChanged: (projectId: number, next: ProjectStatus) => void;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const myId = Number(session?.user?.id);
  const isOwner = myId === p.owner_id;
  const [modalOpen, setModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [loading, setLoading] = useState<"vote" | "fetch-opinions" | "analyzing" | "saving" | "publishing" | "approve" | null>(null);
  const pathByStatus = (status: ProjectStatus) => {
    switch (status){
      case "意見収集中": return `/dashboard/opinion`;
      case "投票中": return `/dashboard/voting`;
      case "可決済": return `/dashboard/approved`;
    }
  };


  const go = (base: string) => {
    router.push(`${base}?project_id=${p.project_id}&list_id=${p.list_id}`);
  };

  const handleClick = () => {
    if (p.status === '意見収集中' && p.owner_id !== myId ) {
      setModalError(null);
      setModalOpen(true);
    } else {
      go(pathByStatus(p.status));
    }
  };

  const verifyAndGo = async (pass: string) => {
    try {
      setVerifying(true);
      setModalError(null);
      const res = await fetch('/api/projects/verify-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: p.project_id,
          list_id: p.list_id,
          pass,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setModalError('パスワードが違います');
        setVerifying(false);
        return;
      }
      setModalOpen(false);
      go('/dashboard/opinion');
    } catch (e) {
      console.error(e);
      setModalError('検証に失敗しました');
    } finally {
      setVerifying(false);
    }
  };

  const toVoting = async () => {
    try {
      setLoading('analyzing'); 

      if (!isOwner || p.status !== '意見収集中') {
        throw new Error('権限がないか、現在の状態で実行できません');
      }

      // 1) 意見取得
      const opRes = await fetch(`/api/projects/${p.project_id}/opinions`);
      const opJson = await opRes.json();
      if (!opRes.ok) throw new Error(opJson?.error ?? '意見取得に失敗');
      const opinions: string[] = (opJson.items ?? [])
        .map((o: any) => (typeof o.text === 'string' ? o.text.trim() : ''))
        .filter((s: string) => s.length > 0);

      if (opinions.length === 0) {
        throw new Error('有効な意見がありません');
      }

      // 2) 分析
      const anRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: p.title, opinions })
      });
      const anJson = await anRes.json();
      if (!anRes.ok) throw new Error(anJson?.error ?? '分析に失敗しました');

      // 3) 案を保存（draft）
      setLoading('saving');
      const idempotencyKey =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
      const saveRes = await fetch(`/api/projects/${p.project_id}/options/bulk-upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({
          options: anJson.analysis.解決策候補.map((o: any, i: number) => ({
            title: o['案の名前'],
            description: `自動生成案`,
            merit: o['メリット'],
            demerit: o['デメリット'],
            ai_recommended: !!o['推奨'],
            created_from: 'auto',
            status: 'draft',
            display_order: i + 1
          }))
        })
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok || !saveJson?.ok) throw new Error(saveJson?.error ?? '案の保存に失敗');

      // 4) 公開（draft -> published）
      setLoading('publishing');
      const pubOptions = await fetch(`/api/projects/${p.project_id}/options/publish`, { method: 'PATCH' });
      const pubOptionsJson = await pubOptions.json();
      if (!pubOptions.ok || !pubOptionsJson?.ok) throw new Error(pubOptionsJson?.error ?? '案の公開に失敗');

      // 5) サーバ状態を「投票中」へ
      const pubProject = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: p.project_id, next: '投票中' })
      });
      const pubProjectJson = await pubProject.json();
      if (!pubProject.ok || !pubProjectJson?.success) throw new Error(pubProjectJson?.error ?? '投票開始に失敗');

      onStatusChanged(p.project_id, '投票中');
    } catch (e: any) {
      alert(e?.message ?? '更新に失敗しました');
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
    <>
    <div className="flex flex-col gap-2 px-6 py-5 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition cursor-pointer shadow-sm"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' ?  handleClick() : null)}
      >
      <div className="min-w-0">
        <div className="font-semibold truncate">{p.title}</div>
        <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-4">
          <span className="font-mono">ID: {p.list_id}</span>
          {p.owner_name ? ` 作成者: ${p.owner_name}` : ""}
          {isOwner ? "(あなたが作成者です)" : ""}
          <span>{p.create_at ? ` 作成日時: ${new Date(p.create_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}` : ""}</span>
        </div>
      </div>
      <hr />
      <div className="flex items-center gap-3 pt-2">
        {/* アクションボタン */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
    <PasswordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={verifyAndGo}
        loading={verifying}
        errorMessage={modalError}
      />
    </>
  );
}