// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

export const runtime = 'nodejs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const InputSchema = z.object({
  topic: z.string().trim().min(1, '議題が空です'),
  opinions: z.array(z.string().trim().min(1)).min(1, '意見が空です'),
});

const OutputSchema = z.object({
  主要論点: z.array(z.string()).min(1).max(10),
  意見グループ: z.object({
    賛成: z.array(z.string()),
    反対: z.array(z.string()),
    '中立/その他': z.array(z.string()),
  }),
  解決策候補: z.array(z.object({
    案: z.string(),
    '案の名前': z.string(),
    メリット: z.string(),
    デメリット: z.string(),
    推奨: z.boolean(),
  })).min(1).max(7),
});

function extractJsonBlock(text: string): string {
  // ```json ... ``` や ``` ... ``` を除去して中身だけ拾う
  const fence = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return text.slice(first, last + 1).trim();
  }
  return text.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, opinions } = InputSchema.parse(body);

    const prompt = `
あなたは会議促進の専門家です。以下の議題と意見群を分析し、**有効なJSONのみ**を出力してください。

【厳守ルール】
- "案" は **決め方（方法論）ではなく、意見の内容（対象/具体物/施策）**に基づくこと。
- 次のような**メタ案（禁止）**を含めない：アンケート調査、人気投票、自由選択、合議制、A/Bテスト、スコアリング、意思決定プロセス全般。
- "案の名前" と "メリット/デメリット" は、**意見データ中に現れた語句 or その同義語**を用いる。新規の抽象語で置き換えない。
- "主要論点" は意見の**内容軸**のみ（決め方やプロセスは除外）。
- 出力直前に自己検証を実施し、**メタ案が混入していない**ことを確認してから出力する。
- 各項目は最大30字、"推奨" は必ず1つだけ true。他は false。
- **出力はJSONのみ**（前後の説明・コードフェンス不可）。

【出力形式】
{
  "主要論点": ["論点1", "論点2", "論点3"],
  "意見グループ": {
    "賛成": ["意見1", "意見2"],
    "反対": ["意見3"],
    "中立/その他": ["意見4"]
  },
  "解決策候補": [
    {"案":"1","案の名前":"短く","メリット":"短く","デメリット":"短く","推奨":true},
    {"案":"2","案の名前":"短く","メリット":"短く","デメリット":"短く","推奨":false},
    {"案":"3","案の名前":"短く","メリット":"短く","デメリット":"短く","推奨":false}
  ]
}

【自己検証チェックリスト（モデル内で確認）】
- 各"案の名前"は**食べ物/製品/機能/方策**などの**対象そのもの**か？（例：カレー、塩ラーメン、フルーツ盛り合わせ）
- "アンケート/人気投票/自由選択/意思決定プロセス" 等の語を含まないか？
- "メリット/デメリット"は、**対象**の利点/欠点になっているか？方法論の長短になっていないか？

議題:
${JSON.stringify(topic)}

意見データ(配列):
${JSON.stringify(opinions)}
`.trim();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); 
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    //  JSON抽出＋検証
    const jsonStr = extractJsonBlock(raw);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: '出力がJSONではありません', raw }, { status: 502 });
    }

    const validated = OutputSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json({ error: '出力スキーマ不一致', issues: validated.error.issues, raw }, { status: 502 });
    }

    //  追加の業務ルール: 推奨が1つだけかをサーバでも担保
    const recommendedCount = validated.data.解決策候補.filter(x => x.推奨).length;
    if (recommendedCount !== 1) {
      return NextResponse.json({ error: '推奨が1つではありません', raw: validated.data }, { status: 502 });
    }

    return NextResponse.json({ analysis: validated.data });
  } catch (err: any) {
    console.error('Analyze API error:', err);
    const message = err?.message || '分析に失敗しました。';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
