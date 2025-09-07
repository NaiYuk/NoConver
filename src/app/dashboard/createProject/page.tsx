
import AppHeader from "@/components/AppHeader";
import AddProject from "@/components/forms/AddProject";

export default function CreateProjectPage() {
    return (
        <>
            <AppHeader />
            <div className="p-4">
                <a href="/dashboard" className="text-blue-500 text-xl hover:underline">← ダッシュボードに戻る</a>
            </div>
            <AddProject />
        </>
    );
}