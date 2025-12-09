import { deleteChat } from "@/actions/chat-actions";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { Trash2 } from "lucide-react";
import { FC } from "react";

import { AlertDialog, AlertDialogTrigger } from "../ui/alert-dialog";
import { AlertDialogContent } from "../ui/alert-dialog";
import { AlertDialogHeader } from "../ui/alert-dialog";
import { AlertDialogTitle } from "../ui/alert-dialog";
import { AlertDialogDescription } from "../ui/alert-dialog";
import { AlertDialogFooter } from "../ui/alert-dialog";
import { AlertDialogCancel } from "../ui/alert-dialog";
import { AlertDialogAction } from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface ChatDeleteProps {
  chatId: string;
}

export const ChatDelete: FC<ChatDeleteProps> = ({ chatId }) => {
  const handleDeleteConfirmClick = async () => {
    withToastHandler(deleteChat, { chatId });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete chat</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this chat and all of its messages. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirmClick}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
