'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';


type Opinion = {
  opinion_id: number;
  user_id: number;
  user_name?: string;
  content: string;
  created_at: string;
};

export default function OpinionPage() {
  const sp = useSearchParams();
  const projectId = sp.get('project_id');
  const listId = sp.get('list_id');

  const router = useRouter();
  const [title, setTitle] = useState<string>(''); 
  const [items, setItems] = useState<Opinion[]>([]);
  const [content, setContent] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [posting, setPosting] = useState(false);

  const canSubmit = useMemo(
    () => !!projectId && content.trim().length > 0 && content.trim().length <= 2000,
    [projectId, content]
  );

  useEffect(() => {
    (async () => {
      if (!projectId) return;
      try {
        const res = await fetch(`/api/projects?project_id=${projectId}`);
        if (res.ok) {
          const data = await res.json();
          const found = data?.projects?.find(
          (p: any) => String(p.project_id) === String(projectId)
        );
        setTitle(found?.title ?? '');
        } else {
          setTitle('');
        }
      } catch {
        setTitle('');
      }
    })();
  }, [projectId]);

  // 意見一覧の取得
  const fetchList = async () => {
    if (!projectId) return;
    setLoadingList(true);
    try {
      const res = await fetch(`/api/opinions?project_id=${projectId}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [projectId]);

  // 送信
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setPosting(true);
      const res = await fetch('/api/opinions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: Number(projectId),
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        alert(data?.error || '投稿に失敗しました');
        return;
      }
      router.push(`/dashboard/opinion/complete?project_id=${projectId}&list_id=${listId}`);
    } catch (e) {
      console.error(e);
      alert('通信エラー');
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
    <AppHeader />
    <div className="p-4">
        <a href="/dashboard/selectProject" className="text-blue-500 text-xl hover:underline">← プロジェクト一覧に戻る</a>
    </div>
    <div className="min-h-screen flex flex-col bg-rose-50">
      <main className="flex flex-1 justify-center items-center w-full px-6">
        <div className="flex w-full max-w-6xl h-[600px] bg-white rounded-xl shadow-lg border overflow-hidden">
          {/* 左：意見一覧 */}
          <aside className="w-1/3 bg-gray-50 border-r flex flex-col p-6 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-700">みんなの意見</h2>

            {loadingList ? (
              <div className="text-sm text-gray-500">読み込み中…</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-gray-500">意見はまだありません</div>
            ) : (
              <ul className="flex flex-col gap-4">
                {items.map((o) => (
                  <li key={o.opinion_id} className="bg-white rounded-md p-4 shadow border">
                    <span className="font-semibold text-green-600">
                      {o.user_name ?? `User#${o.user_id}`}：
                    </span>
                    <span className="whitespace-pre-wrap break-words">{o.content}</span>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(o.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* 右：議題名＋投稿 */}
          <section className="flex-1 flex flex-col justify-between p-10">
            {/* 議題名 */}
            <div className="px-8 pt-8 pb-4 border-b border-gray-100">
              <label className="block text-lg font-bold mb-2 text-blue-700">議題名</label>
              <input
                id="title"
                name="title"
                type="text"
                value={title || '(取得中)'}
                readOnly
                className="w-full rounded-lg border border-blue-200 px-6 py-4 text-xl bg-blue-50 font-semibold text-blue-800 outline-none"
              />
              {/* list_id を見せたい場合 */}
              {listId && (
                <div className="text-xs text-gray-400 mt-1">
                  議題ID: <span className="font-mono">{listId}</span>
                </div>
              )}
            </div>

            {/* 意見入力フォーム */}
            <form onSubmit={onSubmit} className="mt-auto flex flex-col gap-4">
              <label htmlFor="content" className="block text-lg font-bold mb-2 text-gray-700">
                意見を書く
              </label>
              <textarea
                id="content"
                name="content"
                rows={4}
                placeholder="あなたの意見を入力してください（2000字まで）"
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                maxLength={2000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{content.length}/2000</span>
                <button
                  type="submit"
                  disabled={!canSubmit || posting}
                  className={`px-8 py-3 rounded-md text-white text-lg font-semibold transition
                    ${canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {posting ? '送信中…' : '送信'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
    </>
  );
}
