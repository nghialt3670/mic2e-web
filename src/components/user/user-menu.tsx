"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClipboardList, LogOutIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

import { SettingsDialog } from "./settings-dialog";

export const UserMenu = () => {
  const { data: session } = useSession();

  const handleLogoutClick = () => {
    signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/` });
  };

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            className="rounded-full"
            src={session?.user?.image || ""}
            alt="User"
            width={32}
            height={32}
          />
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium">{session?.user?.name}</span>
            <span className="text-sm text-muted-foreground">
              {session?.user?.email}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <SettingsDialog />
        <DropdownMenuItem asChild>
          <Link href="/survey" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Survey
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogoutClick}>
          <LogOutIcon />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
