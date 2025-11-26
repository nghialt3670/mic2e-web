import { Button } from "@/components/ui/button";
import type { ImageUpload } from "@/lib/drizzle/drizzle-schema";
import {
  createFigFileFromObject,
  createImageFileFromFigObject,
  getFigObjectDimensions,
} from "@/lib/fabric";
import { uploadFileToSupabase } from "@/lib/supabase/supabase-utils";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { clientEnv } from "@/utils/client/client-env";
import { getImageDimensions } from "@/utils/client/file-readers";
import { createImageThumbnail } from "@/utils/client/image";
import { to } from "await-to-js";
import { Loader2, Send, WandSparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 } from "uuid";

import { createChat } from "../../actions/chat/create-chat";
import { getResponse } from "../../actions/chat/get-response";
import {
  CreateMessageRequest,
  createMessage,
} from "../../actions/message/create-message";
import {
  CreateAttachmentData,
  CreateImageUploadData,
} from "../../actions/message/create-message";
import { useChatStore } from "../../stores/chat-store";
import {
  InputAttachment,
  useInputAttachmentStore,
} from "../../stores/input-attachment-store";
import { useMessageStore } from "../../stores/message-store";
import { AttachmentDetail, MessageDetail } from "../../types";
import { InputAttachmentList } from "./input-attachment-list";
import { MessageAttachmentInput } from "./message-attachment-input";
import { MessageTextInput } from "./message-text-input";

export const MessageInput = () => {
  const pathname = usePathname();
  const [text, setText] = useState("");
  const { chat, setChat, addChat, updateChatStatus } = useChatStore();
  const { addMessage, updateMessage, removeMessage } = useMessageStore();
  const { clearInputAttachments, getInputAttachments } =
    useInputAttachmentStore();
  const attachments = getInputAttachments();
  const isPending =
    chat?.status === "requesting" || chat?.status === "responding";
  const canSend = text.trim() !== "" && !isPending;

  const getChatId = async () => {
    if (chat) {
      return chat?.id;
    }
    const createdChat = await withToastHandler(createChat, {});
    if (createdChat) {
      setChat(createdChat);
      addChat(createdChat);
      return createdChat?.id;
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateChatStatus("requesting");

    const chatId = await getChatId();
    if (!chatId) {
      updateChatStatus("idle");
      return;
    }

    const [error, uploadedAttachments] = await to(
      uploadInputAttachments(attachments),
    );
    if (error) {
      toast.error("Failed to upload attachments");
      updateChatStatus("idle");
      return;
    }

    const optimisticMessageId = v4();
    const optimisticMessage = buildOptimisticMessage({
      id: optimisticMessageId,
      text,
      attachments: uploadedAttachments,
    });

    addMessage(optimisticMessage);
    setText("");
    clearInputAttachments();
    updateChatStatus("responding");

    const createMessageRequest: CreateMessageRequest = {
      chatId,
      message: {
        text,
        attachments: uploadedAttachments,
      },
    };
    const createdMessage = await withToastHandler(
      createMessage,
      createMessageRequest,
    );
    if (createdMessage) {
      updateMessage(optimisticMessageId, createdMessage);
    } else {
      removeMessage(optimisticMessageId);
      updateChatStatus("idle");
      return;
    }

    const responseMessage = await withToastHandler(getResponse, {
      chatId,
    });

    if (responseMessage) {
      addMessage(responseMessage);
      setChat({
        id: chatId,
        title: responseMessage.text,
        updatedAt: new Date(),
      });
      updateChatStatus("idle");
    } else {
      updateChatStatus("failed");
    }
    if (!pathname.includes(`/chats/${chatId}`)) {
      history.replaceState(null, "", `/chats/${chatId}`);
    }
  };

  return (
    <form className="w-full p-4" onSubmit={handleSubmit}>
      <div className="relative border rounded-2xl bg-white shadow-sm">
        {/* Attachments inside the input */}
        {attachments.length > 0 && (
          <div className="px-3 pt-3">
            <InputAttachmentList />
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
            <MessageAttachmentInput />
          </div>

          <MessageTextInput value={text} onChange={setText} />

          {/* Submit button */}
          <Button
            type="submit"
            variant="outline"
            className="size-10 rounded-full"
            disabled={!canSend}
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

const uploadInputAttachments = async (
  attachments: InputAttachment[],
): Promise<CreateAttachmentData[]> => {
  const bucketName = clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME;
  return await Promise.all(
    attachments.map(async (attachment) => {
      const figFilename = `${v4()}_${attachment.imageFile.name}.fig.json`;
      const figFile = await createFigFileFromObject(
        attachment.figObject,
        figFilename,
      );
      const figUploadPath = `figs/${figFilename}`;
      const { width: figWidth, height: figHeight } =
        await getFigObjectDimensions(attachment.figObject);
      const figUploadUrl = await uploadFileToSupabase(
        figFile,
        figUploadPath,
        bucketName,
      );

      const imageFilename = `${v4()}_${attachment.imageFile.name}`;
      const imageUploadPath = `images/${imageFilename}`;
      const { width: imageWidth, height: imageHeight } =
        await getImageDimensions(attachment.imageFile);
      const imageUploadUrl = await uploadFileToSupabase(
        attachment.imageFile,
        imageUploadPath,
        bucketName,
      );

      const thumbnailFilename = `${v4()}_${attachment.imageFile.name}.jpeg`;
      const imageFile = await createImageFileFromFigObject(
        attachment.figObject,
      );
      const {
        file: thumbnailFile,
        width: thumbnailWidth,
        height: thumbnailHeight,
      } = await createImageThumbnail(imageFile);
      const thumbnailUploadPath = `thumbnails/${thumbnailFilename}`;
      const thumbnailUploadUrl = await uploadFileToSupabase(
        thumbnailFile,
        thumbnailUploadPath,
        bucketName,
      );

      return {
        type: "fig",
        figUpload: {
          filename: figFilename,
          path: figUploadPath,
          url: figUploadUrl,
          width: figWidth,
          height: figHeight,
        },
        imageUpload: {
          filename: attachment.imageFile.name,
          path: imageUploadPath,
          url: imageUploadUrl,
          width: imageWidth,
          height: imageHeight,
        },
        thumbnailUpload: {
          filename: attachment.imageFile.name,
          path: thumbnailUploadPath,
          url: thumbnailUploadUrl,
          width: thumbnailWidth,
          height: thumbnailHeight,
        },
      };
    }),
  );
};

const buildOptimisticMessage = ({
  id,
  text,
  attachments,
}: {
  id: string;
  text: string;
  attachments: CreateAttachmentData[];
}): MessageDetail => {
  const timestamp = new Date();
  return {
    id,
    text,
    createdAt: timestamp,
    updatedAt: timestamp,
    attachments: attachments.map((attachment) =>
      buildOptimisticAttachment(attachment, id, timestamp),
    ),
  } as MessageDetail;
};

const buildOptimisticAttachment = (
  attachment: CreateAttachmentData,
  messageId: string,
  timestamp: Date,
): AttachmentDetail => {
  const attachmentId = v4();
  const figUpload = buildOptimisticImageUpload(attachment.figUpload, timestamp);
  const imageUpload = buildOptimisticImageUpload(
    attachment.imageUpload,
    timestamp,
  );
  const thumbnailUpload = buildOptimisticImageUpload(
    attachment.thumbnailUpload,
    timestamp,
  );

  return {
    id: attachmentId,
    messageId,
    type: attachment.type,
    figUploadId: figUpload?.id ?? null,
    imageUploadId: imageUpload?.id ?? null,
    thumbnailUploadId: thumbnailUpload?.id ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
    figUpload,
    imageUpload,
    thumbnailUpload,
  } as AttachmentDetail;
};

const buildOptimisticImageUpload = (
  upload?: CreateImageUploadData,
  timestamp?: Date,
): ImageUpload | null => {
  if (!upload) {
    return null;
  }

  const id = v4();
  const createdAt = timestamp ?? new Date();
  return {
    id,
    filename: upload.filename,
    path: upload.path,
    url: upload.url,
    width: upload.width,
    height: upload.height,
    createdAt,
    updatedAt: createdAt,
  };
};
