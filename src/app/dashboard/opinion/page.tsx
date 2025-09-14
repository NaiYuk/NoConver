import AppHeader from "@/components/AppHeader";
import Opinion from "@/components/forms/Opinion";

export default function opinionPage() {
    return (
        <>
        <AppHeader /> 
        <div className="p-4">
        <a href="/dashboard/selectProject" className="text-blue-500 text-xl hover:underline">← プロジェクト一覧に戻る</a>
        </div>
        <Opinion />
        </>
    );
}