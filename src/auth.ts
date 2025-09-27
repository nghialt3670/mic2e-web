import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { db } from "./lib/drizzle/db";
import { users } from "./lib/drizzle/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email!),
        });

        let dbUser;

        if (existingUser) {
          const [updatedUser] = await db
            .update(users)
            .set({
              name: user.name,
              image: user.image,
              updatedAt: new Date(),
            })
            .where(eq(users.email, user.email!))
            .returning();
          dbUser = updatedUser;
        } else {
          const [newUser] = await db
            .insert(users)
            .values({
              email: user.email!,
              name: user.name,
              image: user.image,
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
