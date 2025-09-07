import App from "next/app";
import Image from "next/image";
import AppHeader from "../AppHeader";

export const userName = "高魚 桐季"; // とりあえず仮データ
const proposals = [
  {
    value: "1",
    label: "案A：リモートワークの導入",
    recommended: true,
    pros: [
      "通勤時間の削減で生産性向上",
      "柔軟な働き方でワークライフバランス改善",
    ],
    cons: ["コミュニケーション不足の懸念", "セキュリティ管理の強化が必要"],
  },
  {
    value: "2",
    label: "案B：オフィスのレイアウト変更",
    recommended: false,
    pros: [
      "協働スペース拡大でチーム連携が向上",
      "オフィスの雰囲気改善でモチベーションアップ",
    ],
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
  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
      {/* ヘッダー */}
      <AppHeader />

      {/* 投票フォームUI */}
      <main className="flex flex-1 justify-center items-center w-full px-6 py-10">
        <div className="flex w-full max-w-3xl min-h-[600px] bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden flex-col">
          {/* 議題名 */}
          <div className="px-8 pt-8 pb-4 border-b border-gray-100">
            <label
              htmlFor="title"
              className="block text-lg font-bold mb-2 text-blue-700"
            >
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
          <form className="flex flex-col gap-8 px-8 py-8 overflow-y-auto">
            <label className="block text-lg font-bold mb-4 text-gray-700">
              AIが提案した案から1つ選んでください。
            </label>
            <div className="flex flex-col gap-6">
              {proposals.map((p) => (
                <div key={p.value} className="flex flex-col gap-3">
                  <label
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 cursor-pointer transition
                      ${
                        p.recommended
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-gray-50"
                      }
                      hover:border-blue-400 hover:bg-blue-100`}
                  >
                    <input
                      type="radio"
                      name="value"
                      value={p.value}
                      className="accent-blue-600 w-5 h-5"
                    />
                    <span className="text-lg font-medium text-gray-800">
                      {p.label}
                    </span>
                    {p.recommended && (
                      <span className="ml-auto px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold shadow">
                        AIのおすすめ
                      </span>
                    )}
                  </label>

                  {/* メリット・デメリット表示 */}
                  <div className="ml-10 flex flex-col gap-2 text-sm">
                    <div>
                      <span className="font-semibold text-green-700">
                        メリット：
                      </span>
                      <ul className="list-disc list-inside text-gray-700">
                        {p.pros.map((pro, i) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-red-700">
                        デメリット：
                      </span>
                      <ul className="list-disc list-inside text-gray-700">
                        {p.cons.map((con, i) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-10 py-3 rounded-lg bg-blue-600 text-white text-lg font-bold shadow hover:bg-blue-700 transition"
              >
                投票する
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
