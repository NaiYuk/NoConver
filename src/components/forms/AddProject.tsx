'use client';
import Image from "next/image";
import AppHeader from "../AppHeader";
import { useState } from "react";

const userName = "高魚 桐季"; // 仮のユーザー名
export default function AddProject() {
  const [inputTitle, setInputTitle] = useState('');
  const [inputPass, setInputPass] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const owner_id = 1; // 仮ユーザーID
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: inputTitle, owner_id, pass: inputPass })
    });
    const data = await res.json();
    if (data.success) {
      alert(`プロジェクト追加成功！ID: ${data.project_id}, list_id: ${data.list_id}`);
      setInputTitle('');
      setInputPass('');
    } else {
      alert(`追加失敗: ${data.error}`);
    }
  } catch (err) {
    console.error(err);
    alert('通信エラー');
  }
};
  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
          {/* ヘッダー */}
          <AppHeader />
    
            {/* 議題追加フォームUI */}
            <main className="flex flex-1 justify-center items-center w-full">
              <div className="flex w-full max-w-4xl h-[330px] bg-white rounded-xl shadow-lg border overflow-hidden">
                {/* 議題追加フォーム */}
                <section className="flex flex-col flex-1 p-6">
                  <h2 className="text-lg font-bold mb-4 text-gray-700">
                    議題ID: 12345
                    </h2>
                    <form className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                                議題名
                            </label>
                            <input
                                type="text"
                                id="projectName"
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                placeholder="例: 次期プロジェクト管理ツールを何にするか？"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="pass" className="block text-sm font-medium text-gray-700">
                                議題パスワード
                            </label>
                            <input
                                type="password"
                                id="pass"
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                placeholder="パスワードを設定する..."
                                required
                            />
                        </div>
                        <div className="mt-4">
                            <button
                                type="submit"
                                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                議題を追加
                            </button>
                        </div>
                    </form>
                </section>
              </div>
            </main>
        </div>
  );
}