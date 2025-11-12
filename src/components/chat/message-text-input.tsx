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
  const id = v4();
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
  const allowMention = inputAttachments.length > 0;
  const mentionsRef = useRef<MentionItem[]>([]);
  const options = createInteractionOptions();

  // When a new reference is added, update the markup of the previous latest mention
  useEffect(() => {
    if (references.length > prevReferencesLengthRef.current) {
      const prevIndex = references.length - 1;
      if (prevIndex >= 0 && prevIndex < specialChars.length) {
        // Replace the old @ markup with the special character markup for the previous reference
        const oldMarkup = /@\[([^\]]+)\]\(([^)]+)\)/g;
        const matches = [...value.matchAll(oldMarkup)];
        if (matches.length > 0) {
          // Only replace the last occurrence (most recent mention)
          const lastMatch = matches[matches.length - 1];
          const newMarkup = `${specialChars[prevIndex]}[${lastMatch[1]}](${lastMatch[2]})`;
          const newValue =
            value.substring(0, lastMatch.index!) +
            newMarkup +
            value.substring(lastMatch.index! + lastMatch[0].length);
          onChange(newValue);
        }
      }
      prevReferencesLengthRef.current = references.length;
    }
  }, [references.length, value, onChange]);

  const handleAdd = (id: string | number) => {
    const option = options.find((opt) => opt.id === id);
    if (option) {
      setType(option.type);
      addReference({
        id: option.id,
        display: option.display,
        color: String(color),
      });
      setColor(stringToColor(v4()));
    }
  };

  const handleChange: OnChangeHandlerFunc = (
    _event,
    newValue,
    _newPlainTextValue,
    mentions,
  ) => {
    onChange(newValue);
    if (mentions.length < mentionsRef.current.length) {
      const removedMention = mentionsRef.current.find((mention) => !mentions.some((m) => m.id === mention.id));
      if (removedMention) {
        const reference = getReferenceById(removedMention.id);
        if (reference?.targetId) {
          removeObjectById(reference.targetId);
        }
        removeReferenceById(removedMention.id);
      }
    }
    mentionsRef.current = mentions
  };

  const renderSuggestion = (suggestion: SuggestionDataItem) => {
    const option = options.find(
      (opt) => opt.id === suggestion.id,
    );
    const Icon = option?.icon || Box;
    return (
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{`@${option?.display}`}</ItemTitle>
          <ItemDescription>{option?.description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Icon className="size-5" />
        </ItemActions>
      </Item>
    );
  };

  const displayTransform = (_id: string | number, display: string) => {
    return display;
  };

  const renderMentions = () => {
    const suggestions = allowMention ? options : [];
    return references.map((reference, index) => {
      const trigger = specialChars[index];
      const color = (!reference.targetId && index !== references.length - 1) ? "transparent" : reference.color;
      return (
        <Mention
          key={`mention-${index}`}
          trigger={trigger}
          data={[]}
          renderSuggestion={renderSuggestion}
          markup={`${trigger}[__display__](__id__)`}
          displayTransform={displayTransform}
          style={{
            backgroundColor: color,
          }}
        />
      );
    }).concat(
      <Mention
        key={`mention-initial`}
        trigger="@"
        data={suggestions}
        onAdd={handleAdd}
        renderSuggestion={renderSuggestion}
        markup="@[__display__](__id__)"
        displayTransform={displayTransform}
        appendSpaceOnAdd={true}
        style={{
          backgroundColor: color,
        }}
      />
    );
  };

  return (
    <MentionsInput
      value={value}
      onChange={handleChange}
      placeholder="Type a message... (use @ for tools)"
      className="flex-1"
      forceSuggestionsAboveCursor={true}
      style={{
        control: {
          fontSize: 16,
          fontWeight: "normal",
        },
        "&multiLine": {
          control: {
            minHeight: 36,
          },
          highlighter: {
            padding: 6,
            border: "1px solid transparent",
          },
          input: {
            padding: 6,
            border: "1px solid transparent",
            outline: 0,
            minHeight: 36,
          },
        },
      }}
    >
      {renderMentions()}
    </MentionsInput>
  );
};
