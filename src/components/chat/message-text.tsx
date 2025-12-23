import { FC } from "react";

interface MessageTextProps {
  text: string;
}

interface ParsedMention {
  label: string;
  value: string;
  color: string;
}

export const MessageText: FC<MessageTextProps> = ({ text }) => {
  // Parse text and extract mentions with their colors
  // Format: #colorCode[label](value)
  const parseMentions = (text: string) => {
    const parts: Array<{
      type: "text" | "mention";
      content: string;
      mention?: ParsedMention;
    }> = [];

    // Regex to match the mention pattern: #colorCode[label](value)
    // Example stored text:
    //   "Add #2f88a2[point](ref1) in #ff0000[image](ref2)"
    //
    // Groups:
    //   1: colorCode  - hex color without '#', e.g. "2f88a2"
    //   2: label      - visible label, e.g. "point"
    //   3: value      - internal reference id, e.g. "ref1"
    const mentionRegex = /#([a-fA-F0-9]+)\[([^\]]+)\]\(([^)]+)\)/g;

    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        });
      }

      // Extract color code and add # prefix for styling
      const colorCode = match[1];
      const color = `#${colorCode}`;

      // Add mention
      parts.push({
        type: "mention",
        content: `@${match[2]}`, // Display as @label
        mention: {
          label: match[2],
          value: match[3],
          color: color,
        },
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex),
      });
    }

    return parts;
  };

  const parts = parseMentions(text);

  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.content}</span>;
        } else if (part.type === "mention" && part.mention) {
          return (
            <span
              key={index}
              style={{
                backgroundColor: `${part.mention.color}20`,
                color: part.mention.color,
              }}
            >
              {part.content}
            </span>
          );
        }
        return null;
      })}
    </span>
  );
};
