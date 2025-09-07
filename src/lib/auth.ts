// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { name: {}, pass: {} },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.pass) return null;

        // ★ テーブル: users、カラム: name / pass
        const rows = await query<{ id: number; name: string; pass: string }>(
          "SELECT id, name, pass FROM users WHERE name = ? LIMIT 1",
          [credentials.name]
        );
        const found = rows[0];
        if (!found) return null;

        const ok = await bcrypt.compare(credentials.pass, found.pass);
        if (!ok) return null;

        return { id: String(found.id), name: found.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      if (user?.name) token.name = user.name;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string | undefined;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: { signIn: "/dashboard/login" },
  secret: process.env.NEXTAUTH_SECRET,
};