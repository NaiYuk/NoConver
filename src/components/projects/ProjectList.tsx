// components/projects/ProjectList.tsx
"use client";

import { useEffect, useState } from "react";
import ProjectRow from "./ProjectRow";

type Project = {
  project_id: number;
  title: string;
  owner_id: number;
  status: "意見収集中" | "投票中" | "可決済";
  list_id: string;
};

export default function ProjectList() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/projects/"); 
      const data = await res.json();
      setItems(Array.isArray(data?.projects) ? data.projects : []);
      setLoading(false);
    })();
  }, []);

  const onStatusChanged = (id: number, next: Project["status"]) => {
    setItems((prev) =>
      prev.map((p) => (p.project_id === id ? { ...p, status: next } : p))
    );
  };

  if (loading) return <div className="p-4 text-sm text-gray-500">読み込み中…</div>;

  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
      <div className="flex flex-col gap-4 p-4">
        {items.map((p) => (
          <ProjectRow key={p.project_id} p={p} onStatusChanged={onStatusChanged} />
        ))}
      </div>
    </div>
  );
}