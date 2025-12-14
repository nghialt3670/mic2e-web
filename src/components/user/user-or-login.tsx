"use client";

import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "../ui/button";
import { UserMenu } from "./user-menu";

export const UserOrLogin = () => {
  const { data: session } = useSession();

  const handleGoogleLoginClick = () => {
    console.log("[LOGIN] Google login button clicked");
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const callbackUrl = `${basePath}/`;
    console.log("[LOGIN] Callback URL:", callbackUrl);
    signIn("google", { callbackUrl });
  };

  if (!session) {
    return (
      <Button
        className="w-full"
        variant="outline"
        onClick={handleGoogleLoginClick}
      >
        <FcGoogle />
        Login with Google
      </Button>
    );
  }

  return <UserMenu />;
};
