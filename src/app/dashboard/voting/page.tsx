// src/app/dashboard/voting/page.tsx
import AppHeader from "@/components/AppHeader";
import Vote from "@/components/forms/vote"; 
export default function Page() {
    

  return (
    <>
    <AppHeader />
    <div className="p-4">
      <a href="/dashboard/selectProject" className="text-blue-500 text-xl hover:underline">← プロジェクト一覧に戻る</a>
    </div>
    <Vote />
    </>
  )
}
