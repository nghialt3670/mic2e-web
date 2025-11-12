"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Box } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Mention,
  MentionsInput,
  OnChangeHandlerFunc,
  SuggestionDataItem,
} from "react-mentions";

import { useInputAttachmentStore } from "../../stores/input-attachment-store";
import { useInteractionStore } from "../../stores/interaction-store";

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

export const MessageTextInput = ({
  value,
  onChange,
}: MessageTextInputProps) => {
  const { getInputAttachments } = useInputAttachmentStore();
  const inputAttachments = getInputAttachments();
  const { updateCurrentType, getReferences } = useInteractionStore();
  const allowMention = inputAttachments.length > 0;
  const mentionsRef = useRef<string[]>([]);
  const references = getReferences();
  const currentReference = references[references.length - 1];
  const prevReferencesLengthRef = useRef(references.length);

  // When a new reference is added, update the markup of the previous latest mention
  useEffect(() => {
    if (references.length > prevReferencesLengthRef.current) {
      const prevIndex = references.length - 2;
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
    const option = currentReference.options.find((opt) => opt.id === id);
    if (option) {
      updateCurrentType(option.type);
    }
  };

  const handleChange: OnChangeHandlerFunc = (
    event,
    newValue,
    _newPlainTextValue,
    mentions,
  ) => {
    onChange(newValue);
    mentionsRef.current = mentions.map((mention) => mention.id as string);
  };

  const renderSuggestion = (suggestion: SuggestionDataItem) => {
    const option = currentReference.options.find(
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
    return references.map((reference, index) => {
      const suggestions = allowMention
        ? reference.options.map((opt) => ({
            id: opt.id,
            display: opt.display,
          }))
        : [];
      if (index === references.length - 1) {
        return (
          <Mention
            key={`mention-${index}`}
            trigger="@"
            data={suggestions}
            onAdd={handleAdd}
            renderSuggestion={renderSuggestion}
            markup="@[__display__](__id__)"
            displayTransform={displayTransform}
            appendSpaceOnAdd={true}
            style={{
              backgroundColor: reference.color,
            }}
          />
        );
      }
      return (
        <Mention
          key={`mention-${index}`}
          trigger={specialChars[index]}
          data={[]}
          onAdd={handleAdd}
          renderSuggestion={renderSuggestion}
          markup={`${specialChars[index]}[__display__](__id__)`}
          displayTransform={displayTransform}
          appendSpaceOnAdd={true}
          style={{
            backgroundColor: reference.color,
          }}
        />
      );
    });
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
