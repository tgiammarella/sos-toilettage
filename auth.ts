import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        if (user.isBanned) return null;
        if (user.isSuspended && user.suspensionEndsAt && user.suspensionEndsAt > new Date()) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Block unverified non-ADMIN users
        if (user.role !== "ADMIN" && !user.emailVerified) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
      }

      // Re-check ban status on every token refresh (skip initial sign-in)
      if (token.id && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isBanned: true, isSuspended: true, suspensionEndsAt: true },
          });
          const isSuspendedNow = dbUser?.isSuspended && dbUser.suspensionEndsAt && dbUser.suspensionEndsAt > new Date();
          if (!dbUser || dbUser.isBanned || isSuspendedNow) {
            token.id = undefined;
            token.role = undefined;
            token.banned = true;
          }
        } catch {
          // DB error during ban check — allow request to proceed rather than crash
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token?.banned) {
        // Return empty session — forces sign-out on client
        session.user.id = "";
        session.user.role = "";
        return session;
      }
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      // Allow same-origin relative and absolute redirects; reject cross-origin
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});
