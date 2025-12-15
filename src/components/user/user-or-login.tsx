"use client";

import { signIn, useSession } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Button } from "../ui/button";
import { UserMenu } from "./user-menu";

export const UserOrLogin = () => {
  const { data: session, status } = useSession();

  const handleGoogleLoginClick = () => {
    console.log("[LOGIN] Google login button clicked");
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const callbackUrl = `${basePath}/`;
    console.log("[LOGIN] Callback URL:", callbackUrl);
    signIn("google", { callbackUrl });
  };

  const handleGithubLoginClick = () => {
    console.log("[LOGIN] GitHub login button clicked");
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const callbackUrl = `${basePath}/`;
    console.log("[LOGIN] Callback URL:", callbackUrl);
    signIn("github", { callbackUrl });
  };

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          className="w-full"
          variant="outline"
          onClick={handleGoogleLoginClick}
        >
          <FcGoogle />
          Login with Google
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={handleGithubLoginClick}
        >
          <FaGithub />
          Login with GitHub
        </Button>
      </div>
    );
  }

  return <UserMenu />;
};
