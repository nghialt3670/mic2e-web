"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { deleteChat, getChatPage, renameChat as renameChatAction } from "../../actions/chat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "../../components/ui/alert-dialog";
import { useChatStore } from "../../stores/chat-store";
import { withToastHandler } from "../../utils/client/client-action-handlers";
import { ChatItem } from "./chat-item";

export const ChatList = () => {
  const {
    page,
    size,
    total,
    chats,
    loading,
    setChats,
    appendChats,
    removeChat,
    updateChatTitle,
    setLoading,
    hasMore,
  } = useChatStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pathname = usePathname();
  const activeChatId =
    pathname && pathname.startsWith("/chats/")
      ? pathname.split("/").pop() ?? undefined
      : undefined;

  // Initial load
  useEffect(() => {
    const fetchInitial = async () => {
      if (chats.length > 0) return; // Already loaded
      setLoading(true);
      isLoadingRef.current = true;
      try {
        const { data: chatPage } = await getChatPage({ page: 1, size });
        if (chatPage) {
          setChats(chatPage.items, chatPage.total);
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };
    fetchInitial();
  }, []);

  // Load more chats
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore() || loading) return;

    setLoading(true);
    isLoadingRef.current = true;
    try {
      const nextPage = page + 1;
      const { data: chatPage } = await getChatPage({
        page: nextPage,
        size,
      });
      if (chatPage) {
        appendChats(chatPage.items, chatPage.total);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [page, size, loading, hasMore, setLoading, appendChats]);

  // Handle scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Load more when user scrolls to within 100px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  const requestDelete = useCallback((chatId?: string) => {
    if (!chatId) return;
    setPendingDeleteId(chatId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return;

    const chatId = pendingDeleteId;
    setPendingDeleteId(null);

    // Optimistic update: remove first
    const previousChats = chats;
    const previousTotal = total;
    removeChat(chatId);

    const nextCount = previousChats.length - 1;
    if (nextCount < size) {
      // Top up the list if we have fewer than one page of chats
      loadMore();
    }

    const result = await withToastHandler(deleteChat, { chatId });
    if (!result?.success) {
      // revert on failure
      setChats(previousChats, previousTotal);
    }
  }, [pendingDeleteId, chats, total, size, removeChat, loadMore, setChats]);

  const handleRename = useCallback(
    async (chatId?: string, newTitle?: string) => {
      if (!chatId || !newTitle) return;

      const currentChat = chats.find((chat) => chat.id === chatId);
      const previousTitle = currentChat?.title;
      const trimmedTitle = newTitle.trim();

      if (!trimmedTitle || trimmedTitle === (previousTitle ?? "")) {
        return;
      }

      updateChatTitle(chatId, trimmedTitle);

      const result = await withToastHandler(renameChatAction, {
        chatId,
        title: trimmedTitle,
      });

      if (!result) {
        updateChatTitle(chatId, previousTitle ?? undefined);
      } else {
        updateChatTitle(chatId, result.title ?? trimmedTitle);
      }
    },
    [chats, updateChatTitle],
  );

  if (chats.length === 0 && !loading) {
    return (
      <div className="px-2 py-1 text-sm text-muted-foreground">No chats</div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex flex-col gap-1 h-full overflow-y-auto"
    >
      <AnimatePresence initial={false}>
        {chats.map((chat) => (
          <motion.div
            key={chat.id}
            layout
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ChatItem
              chat={chat}
              isActive={chat.id === activeChatId}
              onDelete={requestDelete}
              onRename={handleRename}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {loading && (
        <div className="px-2 py-1 text-sm text-muted-foreground text-center">
          Loading...
        </div>
      )}
      {!hasMore() && chats.length > 0 && (
        <div className="px-2 py-1 text-sm text-muted-foreground text-center">
          No more chats
        </div>
      )}
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat and all of its messages.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
