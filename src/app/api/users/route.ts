// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

// --- REGISTER ---
export async function POST(req: Request) {
  try {
    const { name, pass } = (await req.json()) as { name?: string; pass?: string };
    const _name = (name ?? "").trim();
    const _pass = (pass ?? "").trim();
    if (!_name || !_pass) {
      return NextResponse.json({ ok: false, error: "name と pass は必須です" }, { status: 400 });
    }

    const [dup] = await query<{ cnt: number }>(
      "SELECT COUNT(*) AS cnt FROM users WHERE name = ?",
      [_name]
    );
    if ((dup?.cnt ?? 0) > 0) {
      return NextResponse.json({ ok: false, error: "そのユーザー名は既に使われています" }, { status: 409 });
    }

    const hash = await bcrypt.hash(_pass, 12);
    await query("INSERT INTO users (name, pass) VALUES (?, ?)", [_name, hash]);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "サーバーエラー" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ name: "ゲスト" }, { status: 200 });
    }

    const userId = Number(session.user.id);
    const rows = await query<{ name: string }>(
      "SELECT name FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    const name = rows[0]?.name ?? "ゲスト";
    return NextResponse.json({ name }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ name: "ゲスト", error: "取得失敗" }, { status: 500 });
  }
}
