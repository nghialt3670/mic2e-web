import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { drizzleClient } from "./lib/drizzle/drizzle-client";
import { users } from "./lib/drizzle/drizzle-schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true, // Always enable debug to see errors
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  logger: {
    error(code, ...message) {
      console.error("[AUTH ERROR]", code, ...message);
    },
    warn(code, ...message) {
      console.warn("[AUTH WARN]", code, ...message);
    },
    debug(code, ...message) {
      console.log("[AUTH DEBUG]", code, ...message);
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          console.log("[AUTH] JWT callback - New user login:", user.email);
          
          const existingUser = await drizzleClient.query.users.findFirst({
            where: eq(users.email, user.email!),
          });

          let dbUser;

          if (existingUser) {
            console.log("[AUTH] User exists in DB, updating:", existingUser.id);
            const [updatedUser] = await drizzleClient
              .update(users)
              .set({
                name: user.name,
                imageUrl: user.image,
                updatedAt: new Date(),
              })
              .where(eq(users.email, user.email!))
              .returning();
            dbUser = updatedUser;
          } else {
            console.log("[AUTH] Creating new user in DB:", user.email);
            const [newUser] = await drizzleClient
              .insert(users)
              .values({
                email: user.email!,
                name: user.name,
                imageUrl: user.image,
              })
              .returning();
            dbUser = newUser;
            console.log("[AUTH] New user created with ID:", newUser.id);
          }

          token.id = dbUser.id;
        }
        return token;
      } catch (error) {
        console.error("[AUTH] JWT callback error:", error);
        throw error;
      }
    },
    async session({ session, token }) {
      try {
        console.log("[AUTH] Session callback for user:", token.email);
        session.user.id = token.id as string;
        return session;
      } catch (error) {
        console.error("[AUTH] Session callback error:", error);
        throw error;
      }
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log("[AUTH] ✓ Sign in successful:", {
        user: user.email,
        provider: account?.provider,
      });
    },
    async createUser({ user }) {
      console.log("[AUTH] ✓ User created:", user.email);
    },
    async linkAccount({ user, account }) {
      console.log("[AUTH] ✓ Account linked:", {
        user: user.email,
        provider: account.provider,
      });
    },
  },
  pages: {
    error: "/auth/error",
  },
});
