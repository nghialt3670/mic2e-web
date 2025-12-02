import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Chat } from "@/lib/drizzle/drizzle-schema";
import { cn } from "@/lib/utils";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { FC, SyntheticEvent, useEffect, useRef, useState } from "react";

interface ChatItemProps {
  chat: Partial<Chat>;
  onDelete?: (chatId: string) => void;
  onRename?: (chatId: string, title: string) => void;
  isActive?: boolean;
}

export const ChatItem: FC<ChatItemProps> = ({
  chat,
  onDelete,
  onRename,
  isActive,
}) => {
  const title = chat.title || "New chat";
  const id = chat.id as string | undefined;
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      setLocalTitle(title);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing, title]);

  const handleAction = (
    event: Event | SyntheticEvent,
    action?: (chatId: string) => void,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!id || !action) return;
    action(id);
  };

  const handleRenameSelect = (event: Event | SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!id || !onRename) return;
    setIsEditing(true);
  };

  const handleRenameCommit = () => {
    if (!id || !onRename) {
      setIsEditing(false);
      setLocalTitle(title);
      return;
    }
    const trimmed = localTitle.trim();
    if (!trimmed || trimmed === (chat.title ?? "")) {
      setIsEditing(false);
      setLocalTitle(title);
      return;
    }
    onRename(id, trimmed);
    setIsEditing(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameCommit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      setLocalTitle(title);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-1 rounded px-2 py-1 transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-accent",
      )}
    >
      <Link
        href={`/chats/${chat.id}`}
        className="flex-1 min-w-0"
      >
        {isEditing ? (
          <Input
            ref={inputRef}
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleRenameCommit}
            onKeyDown={handleRenameKeyDown}
            className="h-7 text-sm px-2 py-1"
          />
        ) : (
          <div className="truncate text-sm">{title}</div>
        )}
      </Link>
      {id && (onDelete || onRename) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/80 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              aria-label="Chat actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            {onRename && (
              <DropdownMenuItem
                onSelect={handleRenameSelect}
              >
                <Pencil className="h-4 w-4" />
                Rename
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => handleAction(event, onDelete)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
