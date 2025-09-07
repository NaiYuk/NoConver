// hooks/useAnalysis.ts
import { useState } from 'react';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const analyze = async (opinions: string[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opinions })
      });
      const data = await res.json();
      setResult(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, analyze };
}
