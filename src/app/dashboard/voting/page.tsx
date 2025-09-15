// src/app/dashboard/voting/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';

type OptionItem = {
  option_id: number;
  title: string;
  description?: string | null;
  merit?: string | null;
  demerit?: string | null;
  ai_recommended: boolean;
  display_order: number;
};

export default function VotePage() {
  const sp = useSearchParams();
    const projectId = sp.get('project_id');
    const listId = sp.get('list_id');
  const router = useRouter();

  const [loading, setLoading] = useState<'init'|'vote'|null>('init');
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  // 初期ロード：公開中の案を取得
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await fetch(`/api/projects/${projectId}/options`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? '案の取得に失敗しました');
        const items = (json.items ?? []) as OptionItem[];

        // 表示順で並べ替え
        items.sort((a, b) => a.display_order - b.display_order || a.option_id - b.option_id);

        setOptions(items);
        const ai = items.find(o => o.ai_recommended);
        if (ai) setSelected(ai.option_id);

        const proj = await fetch(`/api/projects/?project_id=${projectId}`);
        if (proj.ok) {
          const pd = await proj.json();
          const found = pd?.projects?.find((p: any) => String(p.project_id) === String(projectId));
          setTopic(found?.title ?? '');
        }
      } catch (e: any) {
        setError(e?.message ?? '読み込みに失敗しました');
      } finally {
        setLoading(null);
      }
    })();
  }, [projectId]);

  const canSubmit = useMemo(() => !!selected && !loading, [selected, loading]);

  const onVote = async () => {
    if (!selected) {
      alert('案を1つ選んでください');
      return;
    }
    try {
      setLoading('vote');
      setError(null);

      const res = await fetch(`/api/projects/${projectId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_id: selected }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? '投票に失敗しました');

      // 成功トースト
      alert('投票が完了しました。ご協力ありがとうございます！');

      // router.push(`/projects/complete/?${projectId});
    } catch (e: any) {
      setError(e?.message ?? '投票に失敗しました');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
    <AppHeader />
    <div className="p-4">
        <a href="/dashboard/selectProject" className="text-blue-500 text-xl hover:underline">← プロジェクト一覧に戻る</a>
    </div>
    <div className="min-h-screen flex flex-col bg-rose-50">
      <main className="flex flex-1 justify-center items-center w-full px-6 py-10">
        <div className="flex w-full max-w-3xl min-h-[620px] bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden flex-col">
          {/* 議題名（任意の表示。topic が無いならプレースホルダ） */}
          <div className="px-8 pt-8 pb-4 border-b border-gray-100">
            <label htmlFor="title" className="block text-lg font-bold mb-2 text-blue-700">議題名</label>
            <input
              id="title"
              name="title"
              type="text"
              value={topic || '（議題タイトル）'}
              readOnly
              className="w-full rounded-lg border border-blue-200 px-6 py-4 text-xl bg-blue-50 font-semibold text-blue-800 outline-none"
            />
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* 投票フォーム */}
          <form className="flex flex-col gap-8 px-8 py-8 overflow-y-auto" onSubmit={(e) => e.preventDefault()}>
            <label className="block text-lg font-bold mb-4 text-gray-700">
              公開中の案から1つ選んでください。
            </label>

            {/* ローディング・空表示 */}
            {loading === 'init' ? (
              <div className="animate-pulse text-gray-500">読み込み中...</div>
            ) : options.length === 0 ? (
              <div className="text-gray-600">公開中の案がありません。</div>
            ) : (
              <div className="flex flex-col gap-6">
                {options.map((o) => (
                  <div key={o.option_id} className="flex flex-col gap-3">
                    <label
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 cursor-pointer transition
                        ${o.ai_recommended ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}
                        hover:border-blue-400 hover:bg-blue-100`}
                    >
                      <input
                        type="radio"
                        name="option"
                        value={o.option_id}
                        checked={selected === o.option_id}
                        onChange={() => setSelected(o.option_id)}
                        className="accent-blue-600 w-5 h-5"
                      />
                      <span className="text-lg font-medium text-gray-800">
                        {o.title}
                      </span>
                      {o.ai_recommended && (
                        <span className="ml-auto px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold shadow">
                          AIのおすすめ
                        </span>
                      )}
                    </label>

                    {/* メリット・デメリット */}
                    {(o.merit || o.demerit || o.description) && (
                      <div className="ml-10 flex flex-col gap-2 text-sm">
                        {o.merit && (
                          <div>
                            <span className="font-semibold text-green-700">メリット：</span>
                            <p className="text-gray-700">{o.merit}</p>
                          </div>
                        )}
                        {o.demerit && (
                          <div>
                            <span className="font-semibold text-red-700">デメリット：</span>
                            <p className="text-gray-700">{o.demerit}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onVote}
                disabled={!canSubmit}
                className={`px-10 py-3 rounded-lg text-white text-lg font-bold shadow transition
                  ${canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                {loading === 'vote' ? '送信中…' : '投票する'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
    </>
  );
}
