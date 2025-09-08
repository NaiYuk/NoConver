import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';
import { query } from '@/lib/db';
import type { ProjectStatus } from "@/types/project";
import { canTransit } from "@/types/project";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

function generateListId() {
  return Math.floor(10000 + Math.random() * 90000).toString(); // 5桁ランダム
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    const ownerId = Number(session.user.id);

    const { title, pass, list_id } = await req.json() as {
      title?: string; pass?: string; list_id?: string;
    };

    if (!title || !pass) {
      return NextResponse.json({ success: false, error: "title / pass は必須です" }, { status: 400 });
    }

    // list_id 検証 or 生成
    let listId = (list_id ?? "").trim();
    if (!/^[A-Za-z0-9]{5}$/.test(listId)) listId = generateListId();

    // list_id 衝突回避（最大5回）
    for (let i = 0; i < 5; i++) {
      const [dup] = await query<{ cnt: number }>(
        "SELECT COUNT(*) AS cnt FROM projects WHERE list_id = ?", [listId]
      );
      if ((dup?.cnt ?? 0) === 0) break;
      listId = generateListId();
      if (i === 4) {
        return NextResponse.json({ success: false, error: "list_id の生成に失敗しました" }, { status: 500 });
      }
    }

    // パスワードはハッシュで保存
    const passHash = await bcrypt.hash(pass, 12);

    // 初期ステータスは「意見収集中」
    const result = await query<any>(
      "INSERT INTO projects (title, owner_id, status, pass, list_id) VALUES (?, ?, '意見収集中', ?, ?)",
      [title, ownerId, passHash, listId]
    );
    const projectId = result[0]?.insertId;

    return NextResponse.json({ success: true, project_id: projectId, list_id: listId }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/projects] error:", e?.message ?? e);
    return NextResponse.json({ success: false, error: "サーバーエラー" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 認証必須にする（
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const rows = await query<{
      project_id: number;
      title: string;
      owner_id: number;
      owner_name: string;
      status: "意見収集中" | "投票中" | "可決済";
      list_id: string;
      create_at: string;
    }>(
      'SELECT p.project_id, p.title, p.owner_id, u.name AS owner_name, p.status, p.list_id, p.create_at ' +
      'FROM projects p ' +
      'LEFT JOIN users u ON p.owner_id = u.id ' +
      'ORDER BY p.create_at DESC'
    );

    return NextResponse.json({ projects: rows }, { status: 200 });
  } catch (e) {
    console.error("[GET /api/projects] error:", e);
    return NextResponse.json({ projects: [], error: "サーバーエラー" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    const ownerId = Number(session.user.id);

    const body = await req.json() as { project_id?: number; next?: ProjectStatus };
    const projectId = Number(body?.project_id ?? 0);
    const next = body?.next;
    if (!projectId || !next) {
      return NextResponse.json({ success: false, error: "project_id / next は必須です" }, { status: 400 });
    }
    if (!['投票中','可決済'].includes(next)) {
      return NextResponse.json({ success: false, error: "不正な next 値です" }, { status: 400 });
    }

    // 所有者＆現ステータス取得
    const rows = await query<{ owner_id: number; status: ProjectStatus }>(
      "SELECT owner_id, status FROM projects WHERE project_id = ? LIMIT 1",
      [projectId]
    );
    const proj = rows[0];
    if (!proj) return NextResponse.json({ success: false, error: "プロジェクトが見つかりません" }, { status: 404 });

    if (proj.owner_id !== ownerId) {
      return NextResponse.json({ success: false, error: "権限がありません（作成者のみ変更可能）" }, { status: 403 });
    }
    if (!canTransit(proj.status, next)) {
      return NextResponse.json({ success: false, error: `「${proj.status}」から「${next}」へは遷移できません` }, { status: 400 });
    }

    await query("UPDATE projects SET status = ? WHERE project_id = ?", [next, projectId]);
    return NextResponse.json({ success: true, project_id: projectId, status: next });
  } catch (e: any) {
    console.error("[PATCH /api/projects] error:", e?.message ?? e);
    return NextResponse.json({ success: false, error: "サーバーエラー" }, { status: 500 });
  }
}