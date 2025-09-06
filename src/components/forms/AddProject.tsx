'use client';
import Image from "next/image";

const userName = "高魚 桐季"; // 仮のユーザー名
export default function AddProject() {
  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
          {/* ヘッダー */}
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