import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs"; // mysql2はNodeランタイム必須

export async function POST(req: Request) {
    try {
        const { name, pass } = await req.json() as { name?: string; pass?: string };

        const _name = (name ?? "").trim();
        const _pass = (pass ?? "").trim();
        if (!_name || !_pass) {
            return NextResponse.json({ ok: false, error: "name と pass は必須です" }, { status: 400 });
        }

        // 既存チェック（任意）
        const [row] = await query<{ cnt: number }>(
            "SELECT COUNT(*) AS cnt FROM users WHERE name = ?",
            [_name]
        );

        if ((row?.cnt ?? 0) > 0) {
            return NextResponse.json(
                { ok: false, error: "そのユーザー名は既に使われています" },
                { status: 409 }
            );
        }

        // パスワードをハッシュ化して保存（平文保存は絶対にNG）
        const hash = await bcrypt.hash(_pass, 12);

        await query("INSERT INTO users (name, pass) VALUES (?, ?)", [_name, hash]);

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "サーバーエラー" }, { status: 500 });
    }
}
