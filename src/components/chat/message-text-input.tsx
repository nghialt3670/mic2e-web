"use client";

import { useReferenceStore } from "@/stores/reference-store";
import { useEffect, useRef, useState } from "react";
import { Mention, MentionsInput, SuggestionDataItem } from "react-mentions";

import { useInputAttachmentStore } from "../../stores/input-attachment-store";


interface MessageTextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const MessageTextInput = ({
  value,
  onChange,
}: MessageTextInputProps) => {
  const { removeObjectById } = useInputAttachmentStore();
  const { references, getCurrentReference, removeReferenceById } =
    useReferenceStore();
  const [localValue, setLocalValue] = useState(value);
  const mentionsInputRef = useRef<HTMLDivElement>(null);
  const previousReferencesRef = useRef(references);

  // Handle change from MentionsInput
  const handleChange = (
    event: any,
    newValue: string,
    newPlainTextValue: string,
    mentions: any[],
  ) => {
    setLocalValue(newValue);
    onChange(newValue);

    // Check for removed mentions and clean up stores
    // Extract the reference values from mention IDs
    // Format: "value@figId"
    const currentMentionIds = mentions
      .map((m) => {
        if (!m.id) return null;
        // Extract the value part before @
        const value = m.id.split("@")[0];
        return value;
      })
      .filter(Boolean);

    // Check which references were removed
    references.forEach((ref) => {
      if (!currentMentionIds.includes(ref.value)) {
        // Remove from reference store
        removeReferenceById(ref.value);
        
        // Remove from canvas - if it's the fig itself (label "image"), pass the figId
        // Otherwise pass the object's own id
        if (ref.label === "image") {
          // For frame/image selection, use the figId to remove the frame at index 1
          removeObjectById(ref.figId);
        } else {
          // For other objects (point, box, scribble), use the value (object's id)
          removeObjectById(ref.value);
        }
      }
    });
  };

  // Auto-insert new reference when added to store
  useEffect(() => {
    const currentRef = getCurrentReference();
    if (!currentRef) return;
    const { color, label, value, figId } = currentRef;
    // Extract color code without # prefix for the format
    const colorCode = color.startsWith("#") ? color.slice(1) : color;
    // Format: #colorCode[label](value@figId) - backend expects # prefix with alphanumeric
    const mentionText = `#${colorCode}[${label}](${value}@${figId})`;

    // Check if reference is already in the value
    if (!localValue.includes(mentionText)) {
      const separator = localValue && !localValue.endsWith(" ") ? " " : "";
      const newValue = localValue + separator + mentionText + " ";
      setLocalValue(newValue);
      onChange(newValue);
    }
  }, [references, getCurrentReference, localValue]);

  // Remove mention text when reference is removed (e.g., when frame is unselected)
  useEffect(() => {
    const previousRefs = previousReferencesRef.current;
    
    // Find removed references
    const removedRefs = previousRefs.filter(
      (prevRef) => !references.find((ref) => ref.value === prevRef.value)
    );

    if (removedRefs.length > 0) {
      let updatedValue = localValue;
      
      // Remove each mention text from the input
      removedRefs.forEach((removedRef) => {
        // Extract color code without # prefix
        const colorCode = removedRef.color.startsWith("#") 
          ? removedRef.color.slice(1) 
          : removedRef.color;
        // Escape special regex characters
        const escapedLabel = removedRef.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedValue = removedRef.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedColorCode = colorCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedFigId = removedRef.figId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Format: #colorCode[label](value@figId)
        const mentionPattern = `#${escapedColorCode}\\[${escapedLabel}\\]\\(${escapedValue}@${escapedFigId}\\)`;
        const regex = new RegExp(mentionPattern, 'g');
        updatedValue = updatedValue.replace(regex, '').trim();
        // Clean up extra spaces
        updatedValue = updatedValue.replace(/\s+/g, ' ');
      });

      if (updatedValue !== localValue) {
        setLocalValue(updatedValue);
        onChange(updatedValue);
      }
    }

    // Update the ref for next comparison
    previousReferencesRef.current = references;
  }, [references]);

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
            padding: "0px 0px",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            fontSize: "14px",
            lineHeight: "1.5",
            fontFamily: "inherit",
            fontWeight: 400,
            letterSpacing: "normal",
            outline: "none",
            overflow: "auto",
            boxSizing: "border-box",
          },
          highlighter: {
            padding: "0px 0px",
            border: "1px solid transparent",
            borderRadius: "6px",
            boxSizing: "border-box",
            lineHeight: "1.5",
            fontSize: "14px",
            fontFamily: "inherit",
            fontWeight: 400,
            letterSpacing: "normal",
            margin: 0,
            overflow: "hidden",
          },
        }}
      >
        {references.length > 0 ? (
          references.map((ref) => {
            const { color, label, value, figId } = ref;
            const mentionData: SuggestionDataItem[] = [];
            // Extract color code without # prefix for the format
            const colorCode = color.startsWith("#") ? color.slice(1) : color;
            // Format: #colorCode[label](value@figId) to match backend pattern
            
            return (
              <Mention
                key={ref.value}
                trigger="#"
                data={mentionData}
                markup={`#${colorCode}[__display__](__id__)`}
                displayTransform={(id, display) => `@${display}`}
                style={{
                  backgroundColor: `${ref.color}20`,
                  color: ref.color,
                  borderRadius: "4px",
                  padding: 0,
                  margin: 0,
                  fontWeight: 400,
                  display: "inline",
                  verticalAlign: "baseline",
                  lineHeight: "inherit",
                  letterSpacing: "inherit",
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
              backgroundColor: "transparent",
              color: "inherit",
            }}
            appendSpaceOnAdd
          />
        )}
      </MentionsInput>
    </div>
  );
};
