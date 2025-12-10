"use client";

import {
  AttachmentCreateRequest,
  createAttachments,
} from "@/actions/attachment-actions";
import { createChat } from "@/actions/chat-actions";
import { completeCycle } from "@/actions/cycle-actions";
import { createMessage } from "@/actions/message-actions";
import { Button } from "@/components/ui/button";
import { ChatContext } from "@/contexts/chat-context";
import { createImageFileFromFigObject } from "@/lib/fabric";
import { uploadFile } from "@/lib/storage";
import {
  AttachmentInput as AttachmentInputType,
  useMessageInputStore,
} from "@/stores/message-input-store";
import { withToastHandler } from "@/utils/client/action-utils";
import { createImageThumbnail } from "@/utils/client/image-utils";
import { Loader2, Send, WandSparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";

import { AttachmentInput } from "./attachment-input";
import { AttachmentInputList } from "./attachment-input-list";
import { MessageTextInput } from "./message-text-input";

export const MessageInput = () => {
  const { chat } = useContext(ChatContext);
  const router = useRouter();
  const { text, setText, getAttachments } = useMessageInputStore();
  const attachments = getAttachments();
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let chatId = chat?.id;
    if (!chatId) {
      const newChat = await withToastHandler(createChat, {
        title: "New Chat",
      });
      chatId = newChat.id;
      router.push(`/chats/${chatId}`);
    }

    const createdMessage = await withToastHandler(createMessage, {
      chatId,
      message: { text },
    });

    const attachmentCreateRequests =
      await uploadAttachmentsAndThumbnails(attachments);
    await withToastHandler(createAttachments, {
      messageId: createdMessage.id,
      attachments: attachmentCreateRequests,
    });

    const completedCycle = await withToastHandler(completeCycle, {
      chatId,
    });

    router.push(`/chats/${chatId}`);
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

  const imageFiles = await Promise.all(files.map(createImageFileFromFigObject));
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
