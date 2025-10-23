"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const handleGoogleLoginClick = () => {
    void signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex w-full items-center justify-center">
      <Button onClick={handleGoogleLoginClick} variant="default" size="lg">
        Login with Google
      </Button>
    </div>
  );
}
