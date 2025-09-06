import Image from "next/image";

export default function Home() {
  const userName = "高魚 桐季"; // とりあえず仮データ
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

      {/* 中央のボタン */}
      <main className="flex flex-1 justify-center items-center">
        <div className="flex flex-col gap-6 md:gap-12 lg:gap-20 w-full max-w-5xl px-6">
          <button className="w-full py-6 text-2xl rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            議題を作成
          </button>
          <button className="w-full py-6 text-2xl rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
            議題に参加
          </button>
        </div>
      </main>
    </div>
  );
}
