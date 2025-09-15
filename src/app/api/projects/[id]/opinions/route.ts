// app/api/projects/[id]/opinions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const { id } = await params;
    const projectId = Number(id);
    if (!projectId) return NextResponse.json({ error: 'project_id 不正' }, { status: 400 });

    const rows = await query<{ opinion_id: number; content: string; created_at: string; user_id?: number | null; }>(
      'SELECT opinion_id, content, created_at FROM opinions WHERE project_id = ? ORDER BY created_at ASC',
      [projectId]
    );

    const items = (rows ?? []).map(r => ({
        opinion_id: r.opinion_id,
        text: r.content,
        created_at: r.created_at,
    }));

    return NextResponse.json({ items });
  } catch (e) {
    console.error('[GET /projects/:id/opinions] error:', e);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
