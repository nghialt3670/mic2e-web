"use client";

import { useEffect, useRef, useState } from "react";
import { Mention, MentionsInput, SuggestionDataItem } from "react-mentions";
import { Canvas } from "fabric";

import { useMessageInputStore } from "@/stores/message-input-store";
import { removeObjectWithReference } from "@/lib/fabric/fabric-utils";

interface MessageTextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const MessageTextInput = ({
  value,
  onChange,
}: MessageTextInputProps) => {
  const { getReferences, removeReference, clearReferences, getAttachments, clearAttachments } = useMessageInputStore();
  const [localValue, setLocalValue] = useState(value);
  const mentionsInputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const references = getReferences();
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

    // Get fresh attachments and canvas refs at the time of change
    const currentAttachments = getAttachments();
    const canvasRefs = currentAttachments
      .map((attachment) => attachment.canvasRef?.current)
      .filter(Boolean);

    references.forEach((ref) => {
      if (!currentMentionIds.includes(ref.value)) {
        removeReference(ref);
        const canvases = canvasRefs
          .map((canvasRef) => canvasRef?.canvas)
          .filter((canvas): canvas is Canvas => !!canvas);
        
        removeObjectWithReference(canvases, ref, (canvas) => {
          // Find the canvas ref that matches this canvas and trigger update
          const canvasRef = canvasRefs.find((ref) => ref?.canvas === canvas);
          canvasRef?.updateFigFile();
        });
      }
    });
  };

  // Auto-insert new reference when added to store
  useEffect(() => {
    const currentRef = references.at(-1);
    if (!currentRef) return;
    const { color, label, value } = currentRef;
    // Extract color code without # prefix for the format
    const colorCode = color.startsWith("#") ? color.slice(1) : color;
    // Format: #colorCode[label](value@figId) - backend expects # prefix with alphanumeric
    const mentionText = `#${colorCode}[${label}](${value})`;

    // Check if reference is already in the value
    if (!localValue.includes(mentionText)) {
      const separator = localValue && !localValue.endsWith(" ") ? " " : "";
      const newValue = localValue + separator + mentionText + " ";
      setLocalValue(newValue);
      onChange(newValue);
    }
  }, [references, localValue]);

  // Remove mention text when reference is removed (e.g., when frame is unselected)
  useEffect(() => {
    const previousRefs = previousReferencesRef.current;

    // Find removed references
    const removedRefs = previousRefs.filter(
      (prevRef) => !references.find((ref) => ref.value === prevRef.value),
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
        const escapedLabel = removedRef.label.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        const escapedValue = removedRef.value.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        const escapedColorCode = colorCode.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        // Format: #colorCode[label](value@figId)
        const mentionPattern = `#${escapedColorCode}\\[${escapedLabel}\\]\\(${escapedValue}\\)`;
        const regex = new RegExp(mentionPattern, "g");
        updatedValue = updatedValue.replace(regex, "").trim();
        // Clean up extra spaces
        updatedValue = updatedValue.replace(/\s+/g, " ");
      });

      if (updatedValue !== localValue) {
        setLocalValue(updatedValue);
        onChange(updatedValue);
      }
    }

    // Update the ref for next comparison
    previousReferencesRef.current = references;
  }, [references]);

  // Sync external value changes and clear references/attachments when value is cleared
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);

      // If value is cleared externally (empty string), clear all references and attachments
      if (!value || value.trim() === "") {
        clearReferences();
        clearAttachments();
      }
    }
  }, [value, localValue, clearReferences, clearAttachments]);

  // Re-focus when value is cleared (e.g., after sending a message)
  const previousValueRef = useRef(localValue);
  useEffect(() => {
    // Only refocus if value was cleared (went from non-empty to empty)
    if (previousValueRef.current && !localValue) {
      const container = mentionsInputRef.current;
      if (!container) return;

      const textarea = container.querySelector("textarea");
      if (textarea) {
        inputRef.current = textarea;
        // Small delay to ensure the input is ready
        setTimeout(() => {
          textarea.focus();
        }, 0);
      }
    }
    previousValueRef.current = localValue;
  }, [localValue]);

  // Auto-focus on mount and keep focused
  useEffect(() => {
    const findAndFocusInput = () => {
      const container = mentionsInputRef.current;
      if (!container) return false;

      // MentionsInput creates a textarea element
      const textarea = container.querySelector("textarea");
      if (textarea) {
        inputRef.current = textarea;
        textarea.focus();
        return true;
      }
      return false;
    };

    // Try to focus immediately
    if (!findAndFocusInput()) {
      // If not found, try again after a short delay (for async rendering)
      const timeoutId = setTimeout(() => {
        findAndFocusInput();
      }, 100);

      return () => clearTimeout(timeoutId);
    }

    // Keep focused when it loses focus
    const handleBlur = (e: Event) => {
      const focusEvent = e as FocusEvent;
      // Don't refocus if user is clicking on a button or interactive element
      const target = focusEvent.relatedTarget as HTMLElement | null;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a"))
      ) {
        return;
      }

      // Use setTimeout to ensure the blur event has completed
      setTimeout(() => {
        const textarea = inputRef.current;
        if (textarea && document.activeElement !== textarea) {
          textarea.focus();
        }
      }, 0);
    };

    // Submit on Enter (without modifiers) instead of inserting newline
    const handleKeyDown = (e: any) => {
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        const target = e.target as HTMLTextAreaElement | null;
        const form = target?.closest("form");
        form?.requestSubmit();
      }
    };

    const textarea = inputRef.current;
    if (textarea) {
      textarea.addEventListener("blur", handleBlur);
      textarea.addEventListener("keydown", handleKeyDown);
      return () => {
        textarea.removeEventListener("blur", handleBlur);
        textarea.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

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
            const { color, label, value } = ref;
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
