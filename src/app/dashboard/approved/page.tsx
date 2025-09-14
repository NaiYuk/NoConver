// src/app/dashboard/approved/page.tsx
import AppHeader from "@/components/AppHeader";

export default function ApprovedPage() {
  return (
    <>
        <AppHeader />
        <div className="p-4">
          <a href="/dashboard/selectProject" className="text-blue-500 text-xl hover:underline">← プロジェクト一覧に戻る</a>
        </div>  
        <div className="flex flex-col items-center justify-center min-h-screen bg-rose-50 px-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-3xl font-bold mb-4 text-blue-600">投票結果</h1>
            {/* ここに投票結果の詳細を表示するコンポーネントを追加 */}
            <p className="text-lg text-gray-700">投票が完了しました。結果はプロジェクトメンバーに通知されます。</p>

            </div>
        </div>
    </>
    );
}