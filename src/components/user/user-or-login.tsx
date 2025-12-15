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
    // Include full path since we're not using Next.js basePath
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    signIn("google", { callbackUrl: `${basePath}/` });
  };

  const handleGithubLoginClick = () => {
    console.log("[LOGIN] GitHub login button clicked");
    // Include full path since we're not using Next.js basePath
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    signIn("github", { callbackUrl: `${basePath}/` });
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
