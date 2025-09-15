// app/api/opinions/create/route.ts
import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import type { RowDataPacket } from 'mysql2';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const { project_id, content } = await req.json();

    if (!project_id || !content || typeof content !== 'string') {
      return NextResponse.json({ error: 'パラメータ不足' }, { status: 400 });
    }
    const trimmed = content.trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
      return NextResponse.json({ error: '意見は1〜2000文字で入力してください' }, { status: 422 });
    }

    const db = await getDbConnection();

    // プロジェクトが「意見収集中」かチェック
    const [projRows] = await db.query<RowDataPacket[]>(
      'SELECT status FROM projects WHERE project_id = ? LIMIT 1',
      [project_id]
    );
    const proj = (projRows as RowDataPacket[])[0];
    if (!proj) return NextResponse.json({ error: '議題が見つかりません' }, { status: 404 });
    if (proj.status !== '意見収集中') {
      return NextResponse.json({ error: '現在は意見投稿できません' }, { status: 403 });
    }
    const [checkRows] = await db.query(
    'SELECT opinion_id FROM opinions WHERE project_id = ? AND user_id = ? LIMIT 1',
    [project_id, userId]
    );

    // 登録
    const [result] = await db.query(
      'INSERT INTO opinions (project_id, user_id, content) VALUES (?,?,?)',
      [project_id, userId, trimmed]
    );
    // @ts-ignore
    const opinion_id = result?.insertId;
    if (Array.isArray(checkRows) && checkRows.length > 0) {
        return NextResponse.json({ error: 'すでに意見を投稿済みです' }, { status: 409 });
    }

    return NextResponse.json({ success: true, opinion_id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '投稿に失敗しました' }, { status: 500 });
  }
}
