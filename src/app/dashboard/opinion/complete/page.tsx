'use client';

import AppHeader from '@/components/AppHeader';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OpinionComplete() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = sp.get('project_id');
  const listId = sp.get('list_id');

  return (
    <>
    <AppHeader />
    <div className="min-h-screen flex flex-col justify-center items-center bg-rose-50">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg border">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          意見を送信しました
        </h1>
        <p className="text-gray-500 mb-6">
          あなたの意見は正常に送信されました<br />
          これ以上の投稿はできません
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(`/dashboard/opinion?project_id=${projectId}&list_id=${listId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            意見一覧に戻る
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            ダッシュボードへ戻る
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
