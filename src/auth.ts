import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { drizzleClient } from "./lib/drizzle/drizzle-client";
import { users } from "./lib/drizzle/drizzle-schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.AUTH_DEBUG === "true",
  trustHost: true,
  providers: [Google],
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
    async signIn({ user, account, profile }) {
      console.log("[AUTH] Sign in event:", {
        user: user.email,
        provider: account?.provider,
      });
    },
  },
});
