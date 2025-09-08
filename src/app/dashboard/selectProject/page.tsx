
import AppHeader from "@/components/AppHeader";
import ListDisplay from "@/components/forms/ListDisplay";
import ProjectList from "@/components/projects/ProjectList";

export default function selectProjectPage() {
    return (
        <>
        <AppHeader />
        <div className="p-4">
            <a href="/dashboard" className="text-blue-500 text-xl hover:underline">← ダッシュボードに戻る</a>
        </div>
        <ProjectList />
        </>
    );
}