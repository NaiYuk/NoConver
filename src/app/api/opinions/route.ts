// app/api/opinions/route.ts
import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';


/* 一覧取得(プロジェクト別) */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ error: 'project_id が必要です' }, { status: 400 });
    }

    const db = await getDbConnection();
    const [rows] = await db.query(
      `SELECT o.opinion_id, o.user_id, u.name AS user_name,
              o.content, o.created_at
         FROM opinions o
         JOIN users u ON u.id = o.user_id
        WHERE o.project_id = ?
        ORDER BY o.created_at DESC
        LIMIT 200`,
      [projectId]
    );

    // @ts-ignore
    return NextResponse.json({ items: rows ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
}
