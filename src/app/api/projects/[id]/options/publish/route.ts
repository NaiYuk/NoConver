import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDbConnection } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1) 認証
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const userId = Number(session.user.id);

    // 2) パラメータ
    const projectId = Number(params.id);
    if (!Number.isFinite(projectId) || projectId <= 0) {
      return NextResponse.json({ ok: false, error: 'INVALID_PROJECT_ID' }, { status: 400 });
    }

    const db = await getDbConnection();

    // 3) 所有者チェック
    const [ownerRows] = await db.query(
      'SELECT owner_id FROM projects WHERE project_id = ? LIMIT 1',
      [projectId]
    );
    const owner = Array.isArray(ownerRows) ? (ownerRows as any[])[0] : null;
    if (!owner) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    if (Number(owner.owner_id) !== userId) {
      return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
    }

    // 4) ボディ（空なら全draftを公開／指定があれば部分公開）
    let optionIds: number[] | null = null;
    const raw = await req.text();
    if (raw && raw.trim()) {
      let body: any;
      try {
        body = JSON.parse(raw);
      } catch {
        return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
      }
      if (Array.isArray(body?.option_ids)) {
        optionIds = body.option_ids
          .map((n: any) => Number(n))
          .filter((n: any) => Number.isFinite(n) && n > 0);
        if (optionIds?.length === 0) optionIds = null;
      }
    }

    // 5) 更新
    let sql = `UPDATE options SET status = 'published' WHERE project_id = ? AND status = 'draft'`;
    let args: any[] = [projectId];
    if (optionIds) {
      const ph = optionIds.map(() => '?').join(',');
      sql += ` AND option_id IN (${ph})`;
      args = [projectId, ...optionIds];
    }

    const [result] = await db.execute<ResultSetHeader>(sql, args);
    const affected = result?.affectedRows ?? 0;

    return NextResponse.json({ ok: true, published: affected }, { status: 200 });
  } catch (e: any) {
    console.error('[PATCH /api/projects/:id/options/publish] error:', e?.message ?? e);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}