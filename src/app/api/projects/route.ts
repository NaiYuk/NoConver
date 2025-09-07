import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

function generateListId() {
  return Math.floor(10000 + Math.random() * 90000).toString(); // 5桁ランダム
}

export async function POST(req: Request) {
  try {
    const { title, owner_id, pass } = await req.json();
    if (!title || !owner_id || !pass) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    const db = await getDbConnection();
    const list_id = generateListId();

    const [result] = await db.query(
      'INSERT INTO projects (title, owner_id, pass, list_id) VALUES (?, ?, ?, ?)',
      [title, owner_id, pass, list_id]
    );

    return NextResponse.json({ success: true, project_id: (result as any).insertId, list_id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'プロジェクトの追加に失敗しました' }, { status: 500 });
  }
}
