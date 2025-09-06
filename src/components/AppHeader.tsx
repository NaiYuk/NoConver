"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function AppHeader() {
  const [userName, setUserName] = useState("ゲスト");

  // API からユーザー名を取得
  useEffect(() => 
    {fetch("/api/users")
    .then(res => res.json())
    .then(data => setUserName(data.name))
    .catch(err => console.error("ユーザー名取得失敗", err));
}, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-300 shadow-sm bg-white/70 backdrop-blur-sm">
      <div className="flex">
        <Image
          src="/no-meeting-room.png"
          alt="ユーザーアイコン"
          width={32}
          height={32}
          className="mr-3"
        />
        <h1 className="text-2xl font-bold">CtrlWin</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* ユーザ名 */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-300 shadow">
          <Image
            src="/user-icon.png"
            alt="ユーザーアイコン"
            width={32}
            height={32}
          />
          <span className="text-gray-700 font-bold">{userName}</span>
          <span className="text-gray-700 font-medium"> さん </span>
        </div>

        <button className="px-4 py-2 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition">
          ログアウト
        </button>
      </div>
    </header>
  );
}
