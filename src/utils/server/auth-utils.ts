import { auth } from "@/auth";

export const getSession = async () => {
  const session = await auth();
  return session;
};

export const getSessionUserId = async () => {
  const session = await auth();
  return session?.user?.id;
};
