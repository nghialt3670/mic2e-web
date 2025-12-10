"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";

import { Button } from "../ui/button";

export const UserOrLogin = () => {
  const { data: session } = useSession();

  const handleGoogleLoginClick = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const handleLogoutClick = () => {
    signOut({ callbackUrl: "/" });
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2">
          <Image
            className="rounded-full"
            src={session?.user?.image || ""}
            alt="User"
            width={32}
            height={32}
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{session?.user?.name}</span>
            <span className="text-sm text-muted-foreground">
              {session?.user?.email}
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleLogoutClick}>
          <LogOutIcon />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
