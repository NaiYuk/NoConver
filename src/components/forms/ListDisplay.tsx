import React from "react";
import Image from "next/image";
import AppHeader from "../AppHeader";

const userName = "高魚 桐季"; // とりあえず仮データ

// 議題データを拡張
const topics = [
  {
    id: 1,
    title: "新しいプロジェクトについて",
    name: "山田 太郎",
    create_at: "2025-09-01 10:30",
  },
  {
    id: 2,
    title: "リモートワークの導入",
    name: "佐藤 花子",
    create_at: "2025-09-02 14:15",
  },
  {
    id: 3,
    title: "オフィスのレイアウト変更",
    name: "高魚 桐季",
    create_at: "2025-09-04 09:00",
  },
  {
    id: 4,
    title: "新しいツールの導入",
    name: "鈴木 一郎",
    create_at: "2025-09-05 16:45",
  },
];

export default function ListDisplay() {
  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
      {/* タイトル一覧表示 */}
      <main className="flex flex-1 justify-center items-center w-full px-6 py-12 bg-gradient-to-b from-rose-50 to-white">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-10">
          {/* セクションタイトル */}
          <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-10 relative">
            議題一覧
            <span className="absolute left-1/2 -bottom-3 w-16 h-1 bg-blue-400 rounded-full transform -translate-x-1/2"></span>
          </h2>

          {/* リスト */}
          <ul className="flex flex-col gap-5">
            {topics.map((topic, index) => (
              <li
                key={topic.id}
                className="flex flex-col gap-2 px-6 py-5 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {/* 項目の番号アイコン */}
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
                    {index + 1}
                  </span>

                  {/* 議題タイトル */}
                  <span className="text-lg font-semibold text-blue-900">
                    {topic.title}
                  </span>
                </div>

                {/* 作成者と日時 */}
                <div className="ml-12 text-sm text-gray-600">
                  <span className="mr-4">作成者: {topic.name}</span>
                  <span>登録日時: {topic.create_at}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
