import { Button } from "@/components/ui/button";
import { createFigFileFromObject, getFigObjectDimensions } from "@/lib/fabric";
import { uploadFileToSupabase } from "@/lib/supabase/supabase-utils";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { clientEnv } from "@/utils/client/client-env";
import { Box, Loader2, MousePointer2, Image as ImageIcon, Send, WandSparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { v4 } from "uuid";

import { createChat } from "../../actions/chat-actions/create-chat";
import { getResponse } from "../../actions/chat-actions/get-response";
import {
  CreateMessageData,
  CreateMessageRequest,
  createMessage,
} from "../../actions/message-actions/create-message";
import { CreateAttachmentData } from "../../actions/message-actions/create-message";
import { useChatStore } from "../../stores/chat-store";
import { useInputAttachmentStore } from "../../stores/input-attachment-store";
import { useInteractionModeStore, InteractionMode } from "../../stores/interaction-mode-store";
import { AttachmentInput } from "../attachment-input";
import { InputAttachmentList } from "../input-attachment-list";
import { getImageDimensions } from "@/utils/client/file-readers";
import { createImageThumbnail } from "@/utils/client/image";
import { useMessageStore } from "../../stores/message-store";

type MentionOption = {
  id: InteractionMode;
  label: string;
  icon: typeof Box;
  description: string;
};

const mentionOptions: MentionOption[] = [
  {
    id: "box",
    label: "box",
    icon: Box,
    description: "Draw a bounding box on the image",
  },
  {
    id: "point",
    label: "point",
    icon: MousePointer2,
    description: "Mark a point on the image",
  },
  {
    id: "image",
    label: "image",
    icon: ImageIcon,
    description: "Select an image region",
  },
];

export const MessageInput = () => {
  const pathname = usePathname();
  const [text, setText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { chat, setChat, addChat, updateChatStatus } = useChatStore();
  const { addMessage } = useMessageStore();
  const { clearInputAttachments, getInputAttachments } =
    useInputAttachmentStore();
  const { mode, setMode, clearMode } = useInteractionModeStore();
  const attachments = getInputAttachments();
  const bucketName = clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME;
  const isPending = chat?.status === "requesting" || chat?.status === "responding";

  const filteredMentions = mentionOptions.filter((option) =>
    option.label.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    // Detect @ mentions
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setShowMentions(true);
      setSelectedMentionIndex(0);
    } else {
      setShowMentions(false);
      setMentionSearch("");
    }
  };

  const handleMentionSelect = (option: MentionOption) => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor = text.slice(cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, -mentionMatch[0].length);
      const newText = `${beforeMention}@${option.label} ${textAfterCursor}`;
      setText(newText);
      setShowMentions(false);
      setMentionSearch("");
      
      // Activate the interaction mode
      if (attachments.length > 0) {
        setMode(option.id, attachments[attachments.length - 1].imageFile.name);
      }
      
      // Focus back on input
      setTimeout(() => {
        inputRef.current?.focus();
        const newCursorPos = beforeMention.length + option.label.length + 2;
        inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMentions || filteredMentions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedMentionIndex((prev) => 
        prev < filteredMentions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedMentionIndex((prev) => 
        prev > 0 ? prev - 1 : filteredMentions.length - 1
      );
    } else if (e.key === "Enter" && showMentions) {
      e.preventDefault();
      handleMentionSelect(filteredMentions[selectedMentionIndex]);
    } else if (e.key === "Escape") {
      setShowMentions(false);
      setMentionSearch("");
    }
  };

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

    if (!text.trim()) return;

    const chatId = await getChatId();
    if (!chatId) return;

    updateChatStatus("requesting");

    const createAttachmentDtos: CreateAttachmentData[] = await Promise.all(
      attachments.map(async (attachment) => {
        const figFilename = `${v4()}_${attachment.imageFile.name}.fig.json`;
        const figFile = await createFigFileFromObject(
          attachment.figObject,
          figFilename,
        );
        const figUploadPath = `figs/${figFilename}`;
        const { width: figWidth, height: figHeight } = await getFigObjectDimensions(attachment.figObject);
        const figUploadUrl = await uploadFileToSupabase(
          figFile,
          figUploadPath,
          bucketName,
        );

        const imageFilename = `${v4()}_${attachment.imageFile.name}`;
        const imageUploadPath = `images/${imageFilename}`;
        const { width: imageWidth, height: imageHeight } = await getImageDimensions(attachment.imageFile);
        const imageUploadUrl = await uploadFileToSupabase(
          attachment.imageFile,
          imageUploadPath,
          bucketName,
        );

        const thumbnailFilename = `${v4()}_${attachment.imageFile.name}.jpeg`;
        const { file: thumbnailFile, width: thumbnailWidth, height: thumbnailHeight } = await createImageThumbnail(attachment.imageFile);
        const thumbnailUploadPath = `thumbnails/${thumbnailFilename}`;
        const thumbnailUploadUrl = await uploadFileToSupabase(thumbnailFile, thumbnailUploadPath, bucketName);

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

    clearInputAttachments();

    const createMessageData: CreateMessageData = {
      text,
      attachments: createAttachmentDtos,
    };

    const createMessageRequest: CreateMessageRequest = {
      chatId,
      message: createMessageData,
    };

    const createdMessage = await withToastHandler(
      createMessage,
      createMessageRequest,
    );
    if (createdMessage) {
      addMessage(createdMessage);
      setText("");
      updateChatStatus("responding");
    } else {
      updateChatStatus("idle");
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
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="relative border rounded-2xl bg-white shadow-sm">
        {/* Attachments inside the input */}
        {attachments.length > 0 && (
          <div className="px-3 pt-3">
            <InputAttachmentList />
          </div>
        )}

        {/* Active mode indicator */}
        {mode !== "none" && (
          <div className="px-3 pt-2 pb-1">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              {mode === "box" && <Box className="size-4 text-blue-600" />}
              {mode === "point" && <MousePointer2 className="size-4 text-blue-600" />}
              {mode === "image" && <ImageIcon className="size-4 text-blue-600" />}
              <span className="flex-1 text-blue-900">
                {mode === "box" && "Draw a box on the image"}
                {mode === "point" && "Click to mark a point"}
                {mode === "image" && "Select an image region"}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-6"
                onClick={clearMode}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Mention suggestions dropdown */}
        {showMentions && filteredMentions.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
            {filteredMentions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 ${
                    index === selectedMentionIndex ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleMentionSelect(option)}
                  onMouseEnter={() => setSelectedMentionIndex(index)}
                >
                  <Icon className="size-5 mt-0.5 shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">@{option.label}</div>
                    <div className="text-sm text-gray-500">
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        
        {/* Input row with buttons */}
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Left buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button size="icon" variant="ghost" className="h-8 w-8" type="button">
              <WandSparkles className="h-5 w-5" />
            </Button>
            <AttachmentInput />
          </div>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (use @ for tools)"
            className="flex-1 h-9 px-3 text-base bg-transparent outline-none"
            disabled={isPending}
          />

          {/* Submit button */}
          <Button
            type="submit"
            variant="outline"
            className="size-10 rounded-full"
            disabled={isPending}
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
