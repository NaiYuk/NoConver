"use client";
import Image from "next/image";

const userName = "高魚 桐季"; // とりあえず仮データ
const proposals = [
  {
    value: "1",
    label: "案A：リモートワークの導入",
    recommended: true,
    pros: ["通勤時間の削減で生産性向上", "柔軟な働き方でワークライフバランス改善"],
    cons: ["コミュニケーション不足の懸念", "セキュリティ管理の強化が必要"],
  },
  {
    value: "2",
    label: "案B：オフィスのレイアウト変更",
    recommended: false,
    pros: ["協働スペース拡大でチーム連携が向上", "オフィスの雰囲気改善でモチベーションアップ"],
    cons: ["改装コストが高い", "工事期間中の業務効率低下"],
  },
  {
    value: "3",
    label: "案C：新しいツールの導入",
    recommended: false,
    pros: ["業務の自動化で効率化が期待できる", "最新技術で競争力を確保"],
    cons: ["習熟に時間がかかる", "導入コストやライセンス費用が発生"],
  },
];

export default function Vote() {
  // 仮：選択された値（将来はURLクエリやstateから取得する）
  const selectedValue = "1";
  const selected = proposals.find((p) => p.value === selectedValue);
  const selectedLabel = selected?.label ?? "（未選択）";

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
            <Image src="/user-icon.png" alt="ユーザーアイコン" width={32} height={32} />
            <span className="text-gray-700 font-bold">{userName}</span>
            <span className="text-gray-700 font-medium"> さん </span>
          </div>

          <button className="px-4 py-2 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition">
            ログアウト
          </button>
        </div>
      </header>

      {/* 投票フォームUI */}
      <main className="flex flex-1 justify-center items-center w-full px-6 py-10">
        <div className="flex w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden flex-col">
          {/* 議題名 */}
          <div className="px-8 pt-8 pb-4 border-b border-gray-100">
            <label htmlFor="title" className="block text-lg font-bold mb-2 text-blue-700">
              議題名
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value="新しいプロジェクトについて"
              readOnly
              className="w-full rounded-lg border border-blue-200 px-6 py-4 text-xl bg-blue-50 font-semibold text-blue-800 outline-none"
            />
          </div>

          {/* 投票フォーム */}
          <form
            className="flex flex-col gap-8 px-8 py-8 overflow-y-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="block text-lg  text-black">
              あなたが選択した案
            </label>

            <p className="text-lg font-semibold text-black">
              {selectedLabel}
            </p>
            <p className="text-lg text-black">
              を選択しました
            </p>


            {/* 送信用の実値（必要なら使用） */}
            <input type="hidden" name="choice" value={selectedValue} />
          </form>
        </div>
      </main>
    </div>
  );
}
