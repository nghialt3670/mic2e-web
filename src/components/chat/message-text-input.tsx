"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Box, LucideIcon, MousePointerClick, SquareDashedMousePointer, SquareMousePointer } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Mention,
  MentionItem,
  MentionsInput,
  OnChangeHandlerFunc,
  SuggestionDataItem,
} from "react-mentions";

import { useInputAttachmentStore } from "../../stores/input-attachment-store";
import { InteractionType, useInteractionStore } from "../../stores/interaction-store";
import { useReferenceStore } from "@/stores/reference-store";
import stringToColor from "string-to-color";
import { v4 } from "uuid";
import { Input } from "../ui/input";

interface MessageTextInputProps {
  value: string;
  onChange: (value: string) => void;
}

const specialChars = [
  "!",
  '"',
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "[",
  "\\",
  "]",
  "^",
  "_",
  "`",
  "{",
  "|",
  "}",
  "~",
  " ",
  "\t",
  "\n",
  "\r",
  "\f",
  "\v",
  "\u00A0",
];

interface InteractionOption {
  id: string;
  display: string;
  type: InteractionType;
  icon: LucideIcon;
  description: string;
}

const createInteractionOptions = (): InteractionOption[] => {
  const id = v4().substring(0, 8);
  return [
    {
      id: `box_${id}`,
      display: "box",
      type: "box",
      icon: SquareDashedMousePointer,
      description: "Draw a bounding box on the image",
    },
    {
      id: `point_${id}`,
      display: "point",
      type: "point",
      icon: MousePointerClick,
      description: "Mark a point on the image",
    },
    {
      id: `image_${id}`,
      display: "image",
      type: "image",
      icon: SquareMousePointer,
      description: "Select an image",
    },
  ];
}

export const MessageTextInput = ({
  value,
  onChange,
}: MessageTextInputProps) => {
  const { getInputAttachments, removeObjectById } = useInputAttachmentStore();
  const inputAttachments = getInputAttachments();
  const { color, setType, setColor } = useInteractionStore();
  const { references, addReference, getCurrentReference, getReferenceById, removeReferenceById } = useReferenceStore();
  const prevReferencesLengthRef = useRef(references.length);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder="Type a message... (use @ for tools)"
      className="flex-1"
    />
  );
};
