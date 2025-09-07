import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "ユーザー名", type: "text" },
        pass: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.pass) return null;

        // DBからユーザーを探す
        const rows = await query<{ id: number; name: string; pass: string }>(
          "SELECT * FROM users WHERE user = ? LIMIT 1",
          [credentials.name]
        );
        const foundUser = rows[0];
        if (!foundUser) return null;

        // bcryptでパスワード照合
        const isValid = await bcrypt.compare(credentials.pass, foundUser.pass);
        if (!isValid) return null;

        // 認証成功 → session.user に入る
        return {
          id: String(foundUser.id),
          name: foundUser.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
