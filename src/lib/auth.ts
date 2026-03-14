import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await db.user.findUnique({
          where: { email },
          include: { business: true },
        });

        if (!user) return null;

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          businessId: user.business?.id,
          businessName: user.business?.name,
          businessSlug: user.business?.slug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.businessId = (user as Record<string, unknown>).businessId as string;
        token.businessName = (user as Record<string, unknown>).businessName as string;
        token.businessSlug = (user as Record<string, unknown>).businessSlug as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).businessId = token.businessId;
        (session.user as unknown as Record<string, unknown>).businessName = token.businessName;
        (session.user as unknown as Record<string, unknown>).businessSlug = token.businessSlug;
      }
      return session;
    },
  },
});
