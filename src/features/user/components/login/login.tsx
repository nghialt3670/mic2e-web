"use client";

import { Button } from "@/components/ui/button";
import { LogInIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export const Login = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <Button size="icon" variant="ghost" onClick={handleLoginClick}>
      <LogInIcon />
    </Button>
  );
};
