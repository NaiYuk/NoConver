import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';

export async function POST(req: Request) {
  try {
    const { project_id, list_id, pass } = await req.json();
    if (!project_id || !list_id || !pass) {
      return NextResponse.json({ ok: false, error: 'パラメータ不足' }, { status: 400 });
    }

    const db = await getDbConnection();
    const [rows] = await db.query(
      'SELECT pass, status FROM projects WHERE project_id = ? AND list_id = ? LIMIT 1',
      [project_id, list_id]
    );

    const row = Array.isArray(rows) && (rows[0] as RowDataPacket);
    if (!row) {
      return NextResponse.json({ ok: false, error: '議題が見つかりません' }, { status: 404 });
    }

    // bcrypt でハッシュ比較（登録済みはハッシュ想定）
    const ok = await bcrypt.compare(pass, row.pass);
    if (!ok) {
      return NextResponse.json({ ok: false, error: 'パスワードが違います' }, { status: 401 });
    }

    // 必要なら最新のstatusを返して画面側で再判定も可能
    return NextResponse.json({ ok: true, status: row.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'サーバーエラー' }, { status: 500 });
  }
}
