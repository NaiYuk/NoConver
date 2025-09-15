// app/api/projects/[id]/options/bulk-upsert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1) 認証
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const userId = Number(session.user.id);

    // 2) パラメータ検証
    const projectId = Number(params.id);
    if (!Number.isFinite(projectId) || projectId <= 0) {
      return NextResponse.json({ ok: false, error: 'INVALID_PROJECT_ID' }, { status: 400 });
    }

    // 3) 所有者チェック
    const ownerRows = await query<{ owner_id: number }>(
      'SELECT owner_id FROM projects WHERE project_id = ? LIMIT 1',
      [projectId]
    );
    const ownerId = ownerRows?.[0]?.owner_id;
    if (!ownerId) {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }
    if (Number(ownerId) !== userId) {
      return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
    }

    // 4) 冪等キー検証
    const idem = req.headers.get('x-idempotency-key') ?? '';
    if (!idem) {
      return NextResponse.json({ ok: false, error: 'IDEMPOTENCY_KEY_REQUIRED' }, { status: 400 });
    }

    // 5) Body 取得（空ボディでも落ちないように text()→JSON.parse）
    const raw = await req.text();
    let body: any = {};
    if (raw && raw.trim()) {
      try {
        body = JSON.parse(raw);
      } catch {
        return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
      }
    }

    // 6) バリデーション（最小）
    const options = Array.isArray(body?.options) ? body.options : [];
    if (options.length === 0) {
      return NextResponse.json({ ok: false, error: 'OPTIONS_EMPTY' }, { status: 400 });
    }

    // 7) INSERT（draftで保存・表示順/メリデメ対応）
    let inserted = 0;
    for (const o of options) {
      const title = (o?.title ?? '').toString().trim();
      if (!title) continue;

      const description = (o?.description ?? '').toString();
      const merit = (o?.merit ?? '').toString();
      const demerit = (o?.demerit ?? '').toString();
      const ai_recommended = !!o?.ai_recommended;
      const created_from = (o?.created_from ?? 'auto') === 'manual' ? 'manual' : 'auto';
      const status = (o?.status ?? 'draft') === 'published' ? 'published' : 'draft';
      const display_order = Number.isFinite(Number(o?.display_order)) ? Number(o.display_order) : 0;

      const res = await query<any>(
        `INSERT INTO options
           (project_id, title, description, merit, demerit, ai_recommended, created_from, status, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [projectId, title, description, merit, demerit, ai_recommended, created_from, status, display_order]
      );
      const optionId = res?.[0]?.insertId;

      // 意見紐づけ
      if (optionId && Array.isArray(o?.opinion_ids) && o.opinion_ids.length > 0) {
        for (const oid of o.opinion_ids) {
          const opinionId = Number(oid);
          if (!Number.isFinite(opinionId) || opinionId <= 0) continue;
          await query<any>(
            `INSERT IGNORE INTO option_opinion_map (option_id, opinion_id)
             VALUES (?, ?)`,
            [optionId, opinionId]
          );
        }
      }
      inserted++;
    }

    return NextResponse.json({ ok: true, inserted }, { status: 200 });
  } catch (e: any) {
    console.error('[POST /projects/:id/options/bulk-upsert] error:', e?.message ?? e);
    return NextResponse.json({ ok: false, error: 'サーバーエラー' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: '認証失敗' }, { status: 401 });

    const { id } = await params;
    const projectId = Number(id);
    if (!projectId) return NextResponse.json({ ok: false, error: 'project_id 不正' }, { status: 400 });

    const ownerRows = await query<{ owner_id: number }>(
      'SELECT owner_id FROM projects WHERE project_id = ? LIMIT 1', [projectId]
    );
    const ownerId = ownerRows[0]?.owner_id;
    if (ownerId !== Number(session.user.id)) {
      return NextResponse.json({ ok: false, error: '権限がありません（作成者のみ）' }, { status: 403 });
    }

    const idem = req.headers.get('x-idempotency-key') ?? '';
    if (!idem) return NextResponse.json({ ok: false, error: 'idempotency-key 必須' }, { status: 400 });

    const { options, meta } = await req.json() as {
      options: { title: string; description?: string; ai_recommended?: boolean; createdFrom?: 'auto'|'manual' }[];
      meta?: any;
    };
    if (!Array.isArray(options) || options.length === 0) {
      return NextResponse.json({ ok: false, error: 'optionsが空です' }, { status: 400 });
    }

    // 挿入
    for (const o of options) {
      await query(
        'INSERT INTO options (project_id, title, description, ai_recommended, created_from) VALUES (?, ?, ?, ?, ?)',
        [projectId, o.title, o.description ?? '', !!o.ai_recommended, o.createdFrom ?? 'auto']
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[POST /projects/:id/options/bulk-upsert] error:', e);
    return NextResponse.json({ ok: false, error: 'サーバーエラー' }, { status: 500 });
  }
}
