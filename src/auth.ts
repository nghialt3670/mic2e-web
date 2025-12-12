import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { drizzleClient } from "./lib/drizzle/drizzle-client";
import { users } from "./lib/drizzle/drizzle-schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [Google],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const existingUser = await drizzleClient.query.users.findFirst({
          where: eq(users.email, user.email!),
        });

        let dbUser;

        if (existingUser) {
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
          const [newUser] = await drizzleClient
            .insert(users)
            .values({
              email: user.email!,
              name: user.name,
              imageUrl: user.image,
            })
            .returning();
          dbUser = newUser;
        }

        token.id = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
