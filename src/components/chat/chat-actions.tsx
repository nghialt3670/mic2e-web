"use client";

import { deleteChat, updateChat } from "@/actions/chat-actions";
import { withToastHandler } from "@/utils/client/action-utils";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ChatActionsProps {
  chatId: string;
  currentTitle?: string | null;
}

export const ChatActions: FC<ChatActionsProps> = ({ chatId, currentTitle }) => {
  const router = useRouter();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(currentTitle || "");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const isActive = pathname === `/c/${chatId}`;

  const handleRename = async () => {
    if (!newTitle.trim()) return;

    setIsLoading(true);
    try {
      await withToastHandler(updateChat, {
        chatId,
        chat: {
          title: newTitle.trim(),
          failed: false,
        },
      });
      setIsRenameOpen(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      if (isActive) {
        router.push("/");
      }
      await withToastHandler(deleteChat, { chatId });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-accent"
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setNewTitle(currentTitle || "");
              setIsRenameOpen(true);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setIsDeleteOpen(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title" className="text-sm font-medium">
              Chat title
            </Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter chat title"
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isLoading || !newTitle.trim()}
            >
              {isLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat and all of its messages.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
