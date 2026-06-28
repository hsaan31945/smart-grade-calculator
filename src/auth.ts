import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validators";
import { getDb } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [Credentials({ credentials: { email: {}, password: {} }, authorize: async credentials => {
    const parsed = loginSchema.safeParse(credentials); if (!parsed.success) return null;
    const user = await getDb().user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  } })],
  callbacks: {
    jwt({ token, user }) { if (user) { token.id = user.id; token.role = (user as { role: string }).role; } return token; },
    session({ session, token }) { if (session.user) { session.user.id = token.id as string; session.user.role = token.role as "STUDENT" | "ADMIN"; } return session; },
  },
});
