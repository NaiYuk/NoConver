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
    {"案": "1", "案の名前": "短く", "メリット": "短く", "デメリット": "短く", "推奨": true},
    {"案": "2", "案の名前": "短く", "メリット": "短く", "デメリット": "短く", "推奨": false},
    {"案": "3", "案の名前": "短く", "メリット": "短く", "デメリット": "短く", "推奨": false}
  ]
}

【ルール】
- "推奨" は必ず1つだけ true とし、残りは false。
- "案" は1/2/3のように簡潔に。
- 出力は必ず有効なJSON。
- 各項目は最大30字以内。
- 賛成・反対の質問と回答が明確に分かれていない場合は、中立/その他に分類。
- 多数決で決めるのではなく、議題解決に最も効果的かつ倫理的な案を推奨。
- 攻撃的な内容や差別的な内容は含めない。
- 出力は全体で500字以内に収める。

【例】
議題: 新しい社内コミュニケーションツールの導入について
意見データ:
- ツールAは使いやすいがコストが高い。
- ツールBは無料だが機能が少ない。
- ツールCは機能が豊富だが学習コストがかかる。
【出力例】
{
  "主要論点": ["コスト", "機能性", "使いやすさ"],
  "意見グループ": {
    "賛成": ["ツールAは使いやすいがコストが高い。"],
    "反対": ["ツールBは無料だが機能が少ない。"],
    "中立/その他": ["ツールCは機能が豊富だが学習コストがかかる。"]
  },
  "解決策候補": [
    {"案": "1", "案の名前": "ツールA導入", "メリット": "使いやすい", "デメリット": "コスト高", "推奨": true},
    {"案": "2", "案の名前": "ツールB導入", "メリット": "無料", "デメリット": "機能少ない", "推奨": false},
    {"案": "3", "案の名前": "ツールC導入", "メリット": "機能豊富", "デメリット": "学習コスト高い", "推奨": false}
  ]
}

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


