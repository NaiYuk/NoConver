import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDbConnection } from '@/lib/db';

export const runtime = 'nodejs';
type RouterParam = { id: string }; 

// 選択肢(options表)の一覧を取得
export async function GET(
    req: NextRequest, 
    context: { params: RouterParam | Promise<RouterParam> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: '認証失敗' }, { status: 401 });
    }
    const userId = Number(session.user.id);
    const { id } = await Promise.resolve(context.params);
    const projectId = Number(id);
    if (!Number.isFinite(projectId) || projectId <= 0) {
      return NextResponse.json({ ok: false, error: '不正なIDです' }, { status: 400 });
    }
    const db = await getDbConnection();
    // 所有者チェック
    {
      const [rows] = await db.query(
        'SELECT owner_id FROM projects WHERE project_id = ? LIMIT 1',
        [projectId]
      );
      const owner = Array.isArray(rows) ? (rows as any[])[0] : null;
        if (!owner) {
        return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
        }
        if (Number(owner.owner_id) !== userId) {
        return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
        }
    }
    // 選択肢一覧取得
    const [rows] = await db.query(
        'SELECT option_id, title, description, merit, demerit, ai_recommended, status, created_from, created_at FROM options WHERE project_id = ? ORDER BY display_order ASC, option_id ASC',
        [projectId]
    );
    const items = Array.isArray(rows) ? (rows as any[]).map(r => ({
        option_id: r.option_id,
        title: r.title,
        description: r.description,
        merit: r.merit,
        demerit: r.demerit,
        ai_recommended: !!r.ai_recommended,
        status: r.status,
        display_order: r.display_order,
        created_from: r.created_from,
        created_at: r.created_at,
    })) : [];
    return NextResponse.json({ ok: true, items }, { status: 200 });
    } catch (e: any) {
    console.error('[GET /projects/:id/options] error:', e?.message ?? e);
    return NextResponse.json({ ok: false, error: 'サーバエラー' }, { status: 500 });
  }
}