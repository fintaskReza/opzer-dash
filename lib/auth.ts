import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword } from "@/lib/db/queries/users";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      orgId: number;
      role: "admin" | "member";
      name: string;
      email: string;
    };
  }
  interface User {
    orgId: number;
    role: "admin" | "member";
  }
}

interface AppToken {
  id: string;
  orgId: number;
  role: "admin" | "member";
  [key: string]: unknown;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await getUserByEmail(credentials.email as string);
        if (!user) return null;

        const valid = await verifyPassword(user, credentials.password as string);
        if (!valid) return null;

        return {
          id: String(user.id),
          orgId: user.orgId,
          role: user.role as "admin" | "member",
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const t = token as AppToken;
      if (user) {
        t.id = user.id!;
        t.orgId = (user as { orgId: number }).orgId;
        t.role = (user as { role: "admin" | "member" }).role;
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as AppToken;
      session.user.id = t.id;
      session.user.orgId = t.orgId;
      session.user.role = t.role;
      return session;
    },
  },
});
