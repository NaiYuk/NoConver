// hooks/useAnalysis.ts
import { useState } from 'react';

type Analysis = {
  主要論点: string[];
  意見グループ: {
    賛成: string[];
    反対: string[];
    '中立/その他': string[];
  };
  解決策候補: {
    案: string;
    '案の名前': string;
    メリット: string;
    デメリット: string;
    推奨: boolean;
  }[];
};

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (topic: string, opinions: string[]) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, opinions }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'サーバエラー');
        return;
      }
      setResult(data.analysis as Analysis);
    } catch (err) {
      console.error(err);
      setError('ネットワークエラー');
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, error, analyze };
}
