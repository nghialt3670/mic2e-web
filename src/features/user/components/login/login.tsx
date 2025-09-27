"use client";

import { Button } from "@/components/ui/button";
import { LogInIcon } from "lucide-react";
import { signIn } from "next-auth/react";

export const Login = () => {
  const handleLoginClick = () => {
    signIn("google");
  };
  return (
    <Button size="icon" variant="ghost" onClick={handleLoginClick}>
      <LogInIcon />
    </Button>
  );
};
