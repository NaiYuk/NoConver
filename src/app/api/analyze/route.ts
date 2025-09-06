// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { topic, opinions } = await req.json();

    if (!topic || topic.trim() === '') {
      return NextResponse.json({ error: '議題が空です' }, { status: 400 });
    }
    if (!opinions || opinions.length === 0) {
      return NextResponse.json({ error: '意見データが空です' }, { status: 400 });
    }

const ANALYSIS_PROMPT = `
あなたは会議促進のプロフェッショナルです。
以下の議題と意見群を分析し、次の形式で**簡潔なJSON**を出力してください。
※出力は必ずJSON形式、各項目は最大50字以内、全体で500字以内に収めてください。

【出力形式】
{
  "主要論点": ["論点1", "論点2", "論点3"],
  "意見グループ": {
    "賛成": ["意見1", "意見2"],
    "反対": ["意見3"],
    "中立/その他": ["意見4"]
  },
  "解決策候補": [
    {"案": "1", "メリット": "短く", "デメリット": "短く", "推奨": true},
    {"案": "2", "メリット": "短く", "デメリット": "短く", "推奨": false},
    {"案": "3", "メリット": "短く", "デメリット": "短く", "推奨": false}
  ]
}

【ルール】
- "推奨" は必ず1つだけ true とし、残りは false。
- "案" は1/2/3のように簡潔に。
- 出力は必ず有効なJSON。
- 各項目は最大50字以内。

議題:
${topic}

意見データ:
${opinions.join('\n')}
`;


    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(ANALYSIS_PROMPT);
    const summary = result.response.text();

    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Gemini API error:', err);
    return NextResponse.json({ error: '分析に失敗しました。' }, { status: 500 });
  }
}


