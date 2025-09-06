'use client';

import { useState } from 'react';

export default function AnalysisPage() {
  const [topic, setTopic] = useState('');
  const [opinions, setOpinions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const addOpinion = () => {
    if (input.trim() === '') return;
    setOpinions([...opinions, input.trim()]);
    setInput('');
  };

  const analyze = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, opinions })
      });
      const data = await res.json();
      setResult(data.summary || '分析結果がありません');
    } catch (err) {
      console.error(err);
      setResult('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">会議分析デモ</h1>

      {/* 議題入力欄 */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">議題</label>
        <input
          className="w-full border p-2 rounded"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="例: 週休3日制を導入すべきか？"
        />
      </div>

      {/* 意見入力欄 */}
      <div className="flex mb-2">
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="意見を入力"
        />
        <button
          className="ml-2 bg-blue-500 text-white px-4 rounded"
          onClick={addOpinion}
        >
          追加
        </button>
      </div>

      {/* 意見リスト */}
      <ul className="mb-4 list-disc list-inside">
        {opinions.map((op, idx) => <li key={idx}>{op}</li>)}
      </ul>

      {/* 分析実行 */}
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={analyze}
        disabled={loading || opinions.length === 0 || !topic}
      >
        {loading ? '分析中...' : '分析する'}
      </button>

      {/* 結果表示 */}
      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-50 whitespace-pre-line">
          <h2 className="font-bold mb-2">分析結果</h2>
          {result}
        </div>
      )}
    </div>
  );
}
