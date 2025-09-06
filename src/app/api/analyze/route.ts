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
    {"案": "A", "メリット": "短く", "デメリット": "短く"},
    {"案": "B", "メリット": "短く", "デメリット": "短く"},
    {"案": "C", "メリット": "短く", "デメリット": "短く"}
  ],
  "推奨案": {"案": "A", "理由": "短く"}
}

【議題例】
- 賛否型: 「社内に喫煙室を設けるべきか？」
- 多角的検討型: 「次期プロジェクト管理ツールを何にするか？」

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


