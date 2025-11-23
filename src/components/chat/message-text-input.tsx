"use client";

import { useInputAttachmentStore } from "../../stores/input-attachment-store";
import { useReferenceStore } from "@/stores/reference-store";
import { useEffect, useRef, useState } from "react";
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions';

interface MessageTextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const MessageTextInput = ({
  value,
  onChange,
}: MessageTextInputProps) => {
  const { removeObjectById } = useInputAttachmentStore();
  const { references, getCurrentReference, removeReferenceById } = useReferenceStore();
  const [localValue, setLocalValue] = useState(value);
  const mentionsInputRef = useRef<HTMLDivElement>(null);

  // Handle change from MentionsInput
  const handleChange = (
    event: any,
    newValue: string,
    newPlainTextValue: string,
    mentions: any[]
  ) => {
    setLocalValue(newValue);
    onChange(newValue);

    // Check for removed mentions and clean up stores
    // Extract the reference values from mention IDs (format: value@figId)
    const currentMentionIds = mentions.map(m => m.id?.split('@')[0]).filter(Boolean);
    references.forEach(ref => {
      if (!currentMentionIds.includes(ref.value)) {
        removeReferenceById(ref.value);
        removeObjectById(ref.value);
      }
    });
  };

  // Generate a unique trigger character for a reference
  const getTriggerForRef = (refValue: string) => {
    // Use the reference value to generate a unique trigger
    // We'll use @ followed by a unique identifier
    return `@${refValue}:`;
  };

  // Auto-insert new reference when added to store
  useEffect(() => {
    const currentRef = getCurrentReference();
    if (!currentRef) return;

    const trigger = getTriggerForRef(currentRef.value);
    const mentionText = `${trigger}[${currentRef.label}](${currentRef.value}:${currentRef.color}@${currentRef.figId})`;
    
    // Check if reference is already in the value
    if (!localValue.includes(mentionText)) {
      const separator = localValue && !localValue.endsWith(" ") ? " " : "";
      const newValue = localValue + separator + mentionText + " ";
      setLocalValue(newValue);
      onChange(newValue);
    }
  }, [references, getCurrentReference]);

  // Sync external value changes
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <div className="flex-1" ref={mentionsInputRef}>
      <MentionsInput
        value={localValue}
        onChange={handleChange}
        placeholder="Type a message..."
        className="mentions-input"
        style={{
          input: {
            padding: '0px 0px',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'inherit',
            fontWeight: 400,
            letterSpacing: 'normal',
            outline: 'none',
            overflow: 'auto',
            boxSizing: 'border-box',
          },
          highlighter: {
            padding: '0px 0px',
            border: '1px solid transparent',
            borderRadius: '6px',
            boxSizing: 'border-box',
            lineHeight: '1.5',
            fontSize: '14px',
            fontFamily: 'inherit',
            fontWeight: 400,
            letterSpacing: 'normal',
            margin: 0,
            overflow: 'hidden',
          },
        }}
      >
        {references.length > 0 ? (
          references.map((ref) => {
            const trigger = getTriggerForRef(ref.value);
            const mentionData: SuggestionDataItem[] = [];
            
            return (
              <Mention
                key={ref.value}
                trigger={trigger}
                data={mentionData}
                markup={`${trigger}[__display__](__id__)`}
                displayTransform={(id, display) => `@${display}`}
                style={{
                  backgroundColor: `${ref.color}20`,
                  color: ref.color,
                  borderRadius: '4px',
                  padding: 0,
                  margin: 0,
                  fontWeight: 400,
                  display: 'inline',
                  verticalAlign: 'baseline',
                  lineHeight: 'inherit',
                  letterSpacing: 'inherit',
                }}
                appendSpaceOnAdd
              />
            );
          })
        ) : (
          // Always render at least one Mention component to prevent errors
          <Mention
            trigger="@"
            data={[]}
            markup="@[__display__](__id__)"
            displayTransform={(id, display) => `@${display}`}
            style={{
              backgroundColor: 'transparent',
              color: 'inherit',
            }}
            appendSpaceOnAdd
          />
        )}
      </MentionsInput>
    </div>
  );
};