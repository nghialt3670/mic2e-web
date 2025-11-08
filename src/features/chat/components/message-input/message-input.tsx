import { Button } from "@/components/ui/button";
import { createFigFileFromObject, getFigObjectDimensions } from "@/lib/fabric";
import { uploadFileToSupabase } from "@/lib/supabase/supabase-utils";
import { withToastHandler } from "@/utils/client/client-action-handlers";
import { clientEnv } from "@/utils/client/client-env";
import { Box, Loader2, MousePointer2, Image as ImageIcon, Send, WandSparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { v4 } from "uuid";
import { MentionsInput, Mention } from "react-mentions";

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
import { useAnnotationStore, getNextColor, resetColorIndex } from "../../stores/annotation-store";
import { AttachmentInput } from "../attachment-input";
import { InputAttachmentList } from "../input-attachment-list";
import { getImageDimensions } from "@/utils/client/file-readers";
import { createImageThumbnail } from "@/utils/client/image";
import { useMessageStore } from "../../stores/message-store";

type MentionOption = {
  id: string;
  display: string;
  type: Exclude<InteractionMode, "none" | "image">;
  icon: typeof Box;
  description: string;
};

type Tag = {
  id: string;
  type: Exclude<InteractionMode, "none" | "image">;
  label: string;
  color: string;
  display: string;
};

const mentionOptions: MentionOption[] = [
  {
    id: "box",
    display: "box",
    type: "box",
    icon: Box,
    description: "Draw a bounding box on the image",
  },
  {
    id: "point",
    display: "point",
    type: "point",
    icon: MousePointer2,
    description: "Mark a point on the image",
  },
];

export const MessageInput = () => {
  const pathname = usePathname();
  const [text, setText] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const prevTextRef = useRef<string>("");
  const { chat, setChat, addChat, updateChatStatus } = useChatStore();
  const { addMessage } = useMessageStore();
  const { clearInputAttachments, getInputAttachments } =
    useInputAttachmentStore();
  const { mode, setMode, clearMode } = useInteractionModeStore();
  const { removeAnnotation, clearAnnotations } = useAnnotationStore();
  const attachments = getInputAttachments();
  const bucketName = clientEnv.NEXT_PUBLIC_ATTACHMENT_BUCKET_NAME;
  const isPending = chat?.status === "requesting" || chat?.status === "responding";

  // Handle when a mention is added
  const handleAdd = (id: string | number) => {
    const option = mentionOptions.find((opt) => opt.id === id);
    if (!option) return;

    // Create a new tag with unique ID and color
    const newTag: Tag = {
      id: v4(),
      type: option.type,
      label: option.display,
      display: `@${option.display}`,
      color: getNextColor(),
    };

    setTags([...tags, newTag]);

    // Activate the interaction mode - user can draw on any canvas directly
    if (attachments.length > 0) {
      setMode(
        option.type as InteractionMode,
        null, // No specific target - any canvas can be used
        newTag.id,
        newTag.color
      );
    }
  };

  // Detect when mentions are removed from text and remove their annotations
  useEffect(() => {
    const currentText = text || "";
    const prevText = prevTextRef.current;

    // Extract mention displays from current and previous text
    // react-mentions format: @[display](id)
    const extractMentionDisplays = (txt: string): Set<string> => {
      const displays = new Set<string>();
      const mentionRegex = /@\[([^\]]+)\]\([^)]+\)/g;
      let match;
      while ((match = mentionRegex.exec(txt)) !== null) {
        displays.add(match[1]); // display is the first capture group
      }
      return displays;
    };

    const currentDisplays = extractMentionDisplays(currentText);
    const prevDisplays = extractMentionDisplays(prevText);

    // Find mentions that were in previous text but not in current (i.e., were removed)
    const removedDisplays = Array.from(prevDisplays).filter(
      (display) => !currentDisplays.has(display)
    );

    if (removedDisplays.length > 0) {
      // Find and remove tags with matching labels
      const tagsToRemove = tags.filter((tag) =>
        removedDisplays.includes(tag.label)
      );

      if (tagsToRemove.length > 0) {
        // Remove tags from state
        setTags((prevTags) =>
          prevTags.filter((tag) => !tagsToRemove.includes(tag))
        );

        // Remove corresponding annotations from canvas
        tagsToRemove.forEach((tag) => {
          removeAnnotation(tag.id);
        });

        // Clear interaction mode if active
        if (mode !== "none") {
          clearMode();
        }
      }
    }

    // Update previous text ref
    prevTextRef.current = currentText;
  }, [text, tags, removeAnnotation, mode, clearMode]);

  // Extract plain text without markup for submission
  const getPlainTextForSubmit = (): string => {
    // Remove all @[display](id) markup and replace with @display
    // react-mentions default format: @[display](id)
    return (text || "").replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1');
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

    // Get plain text for submission
    const plainText = getPlainTextForSubmit();

    clearInputAttachments();
    clearAnnotations();
    setTags([]);
    clearMode();
    resetColorIndex();
    setText(""); // Clear the mention input

    const createMessageData: CreateMessageData = {
      text: plainText,
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
        
        {/* Input row with buttons */}
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Left buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button size="icon" variant="ghost" className="h-8 w-8" type="button">
              <WandSparkles className="h-5 w-5" />
            </Button>
            <AttachmentInput />
          </div>

          {/* Text input with mentions */}
          <MentionsInput
            value={text}
            onChange={(e: { target: { value: string } }) => setText(e.target.value)}
            placeholder="Type a message... (use @ for tools)"
            disabled={isPending}
            className="flex-1"
            style={{
              control: {
                fontSize: 16,
                fontWeight: 'normal',
              },
              '&multiLine': {
                control: {
                  minHeight: 36,
                },
                highlighter: {
                  padding: 6,
                  border: '1px solid transparent',
                },
                input: {
                  padding: 6,
                  border: '1px solid transparent',
                  outline: 0,
                  minHeight: 36,
                },
              },
              suggestions: {
                list: {
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  maxHeight: '16rem',
                  overflow: 'auto',
                },
                item: {
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  '&focused': {
                    backgroundColor: '#f9fafb',
                  },
                },
              },
            }}
          >
            <Mention
              trigger="@"
              data={mentionOptions.map((opt) => ({
                id: opt.id,
                display: opt.display,
                type: opt.type,
              }))}
              onAdd={(id: string | number, display: string) => handleAdd(id)}
              renderSuggestion={(
                suggestion: { id: string | number; display?: string },
                _search: string,
                highlightedDisplay: React.ReactNode
              ) => {
                const option = mentionOptions.find((opt) => opt.id === suggestion.id);
                const Icon = option?.icon || Box;
                return (
                  <div className="flex items-start gap-3">
                    <Icon className="size-5 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{highlightedDisplay}</div>
                      <div className="text-sm text-gray-500">{option?.description}</div>
                    </div>
                  </div>
                );
              }}
              markup="@[__display__](__id__:__type__)"
              displayTransform={(_id: string | number, display: string) => `@${display}`}
              style={{
                backgroundColor: '#3b82f6',
              }}
            />
          </MentionsInput>

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
