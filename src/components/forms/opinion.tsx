'use client';

export default function Opinion() {
  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
      {/* 議題フォームUI */}
      <main className="flex flex-1 justify-center items-center w-full px-6">
        <div className="flex w-full max-w-6xl h-[600px] bg-white rounded-xl shadow-lg border overflow-hidden">
          {/* 左側：意見一覧 */}
          <aside className="w-1/3 bg-gray-50 border-r flex flex-col p-6 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-700">
              みんなの意見
            </h2>
            <ul className="flex flex-col gap-4">
              {/* 仮データ例 */}
              <li className="bg-white rounded-md p-4 shadow border">
                <span className="font-semibold text-green-600">山田太郎：</span>
                <span>もっと効率的な進め方が必要だと思います。</span>
              </li>
              <li className="bg-white rounded-md p-4 shadow border">
                <span className="font-semibold text-green-600">佐藤花子：</span>
                <span>新しいツールの導入を検討したいです。</span>
              </li>
              {/* ...他の意見... */}
            </ul>
          </aside>

          {/* 右側：議題名と意見入力 */}
          <section className="flex-1 flex flex-col justify-between p-10">
            {/* 右上：議題名 */}
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

            {/* 右下：意見入力フォーム */}
            <form className="mt-auto flex flex-col gap-4">
              <label
                htmlFor="content"
                className="block text-lg font-bold mb-2 text-gray-700"
              >
                意見を書く
              </label>
              <textarea
                id="content"
                name="content"
                rows={4}
                placeholder="あなたの意見を入力してください"
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-md bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition"
                >
                  送信
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

