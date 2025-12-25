"use client";

import {
  AttachmentCreateRequest,
  createAttachments,
} from "@/actions/attachment-actions";
import { createChat } from "@/actions/chat-actions";
import {
  clearCycle,
  createCycle,
  generateCycle,
} from "@/actions/cycle-actions";
import { createMessage } from "@/actions/message-actions";
import { Button } from "@/components/ui/button";
import { ChatContext } from "@/contexts/chat-context";
import {
  createFigObjectFromFigFile,
  createImageFileFromFigObject,
} from "@/lib/fabric";
import { uploadFile } from "@/lib/storage";
import {
  AttachmentInput as AttachmentInputType,
  useMessageInputStore,
} from "@/stores/message-input-store";
import { withToastHandler } from "@/utils/client/action-utils";
import { createImageThumbnail } from "@/utils/client/image-utils";
import { Send, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useRef, useState } from "react";

import { AttachmentInput } from "./attachment-input";
import { AttachmentInputList } from "./attachment-input-list";
import { MessageTextInput } from "./message-text-input";

export const MessageInput = () => {
  const router = useRouter();
  const { chat } = useContext(ChatContext);
  const { text, setText, clearText, getAttachments, clearAttachments } =
    useMessageInputStore();
  const attachments = getAttachments();
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to force router refresh with proper timing
  const forceRefresh = async () => {
    return new Promise<void>((resolve) => {
      // Call router.refresh()
      router.refresh();

      // Wait for Next.js to process the refresh
      // Use a longer timeout to ensure server components re-fetch
      setTimeout(resolve, 150);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple submissions or empty submissions
    if (isSubmittingRef.current || isSubmitting || !text.trim()) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // Store the text value before any operations to prevent cursor issues
    const messageText = text.trim();

    try {
      let chatId = chat?.id;
      if (!chatId) {
        const newChat = await withToastHandler(createChat, {
          chat: {
            title: "New Chat",
          },
        });
        chatId = newChat.id;
        // Navigate to the new chat page and wait for navigation to complete
        await router.push(`/c/${chatId}`);
        // Refresh to ensure server components re-fetch with the new chat
        router.refresh();
        // Wait for the refresh to complete before proceeding
        // Production builds need more time for server components to re-fetch and context to update
        await new Promise<void>((resolve) => setTimeout(resolve, 400));
      }

      // Ensure we have a valid chatId before proceeding
      if (!chatId) {
        throw new Error("Chat ID is required");
      }

      const createdMessage = await withToastHandler(createMessage, {
        chatId,
        message: { text: messageText },
      });

      if (attachments.length > 0) {
        await withToastHandler(createAttachments, {
          messageId: createdMessage.id,
          attachments: await uploadAttachmentsAndThumbnails(attachments),
        });
      }

      // Create cycle and force UI update
      const createdCycle = await withToastHandler(createCycle, {
        chatId,
        requestId: createdMessage.id,
      });

      // Clear text and attachments only after cycle is created
      // This ensures the form submission is complete before clearing
      clearText();
      clearAttachments();

      // Clear cycle (cleanup) and start generation
      setTimeout(async () => {
        await withToastHandler(clearCycle, {
          cycleId: createdCycle.id,
        });

        // Start generation (WebSocket will handle progress updates)
        await withToastHandler(generateCycle, {
            cycleId: createdCycle.id,
          });

      // The CycleProgressTracker component will handle WebSocket connection
      // and progress updates via ChatContext
      }, 100);
    } catch (error) {
      console.error("Error submitting message:", error);
      // Error is already shown via withToastHandler
      // Just refresh to show the current state
      await forceRefresh();
    } finally {
      // Reset submitting state after completion
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="relative border rounded-2xl bg-white shadow-sm">
        {/* Attachments inside the input */}
        {attachments.length > 0 && (
          <div className="px-3 pt-3">
            <AttachmentInputList />
          </div>
        )}

        {/* Input row with buttons */}
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Left buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              type="button"
            >
              <WandSparkles className="h-5 w-5" />
            </Button>
            <AttachmentInput />
          </div>

          <MessageTextInput value={text} onChange={setText} />

          {/* Submit button */}
          <Button
            type="submit"
            variant="outline"
            className="size-10 rounded-full"
          >
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </form>
  );
};

const uploadAttachmentsAndThumbnails = async (
  attachments: AttachmentInputType[],
): Promise<AttachmentCreateRequest[]> => {
  const files = await Promise.all(
    attachments.map((attachment) => attachment.file),
  );
  const fileIds = await Promise.all(files.map(uploadFile));

  const figObjects = await Promise.all(files.map(createFigObjectFromFigFile));
  const imageFiles = await Promise.all(
    figObjects.map(createImageFileFromFigObject),
  );
  const thumbnailResults = await Promise.all(
    imageFiles.map(createImageThumbnail),
  );
  const thumbnailFiles = thumbnailResults.map((result) => result.file);
  const thumbnailFileIds = await Promise.all(thumbnailFiles.map(uploadFile));

  return attachments.map((attachment, index) => ({
    fileId: fileIds[index],
    filename: attachment.file.name,
    thumbnail: {
      fileId: thumbnailFileIds[index],
      width: thumbnailResults[index].width,
      height: thumbnailResults[index].height,
    },
  }));
};
