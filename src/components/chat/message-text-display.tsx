import { FC } from "react";

interface MessageTextDisplayProps {
  text: string;
}

interface ParsedMention {
  label: string;
  value: string;
  color: string;
  figId: string;
}

export const MessageTextDisplay: FC<MessageTextDisplayProps> = ({ text }) => {
  // Parse text and extract mentions with their colors
  // Format: @{value}:[label](value:color@figId)
  const parseMentions = (text: string) => {
    const parts: Array<{ type: 'text' | 'mention'; content: string; mention?: ParsedMention }> = [];
    
    // Regex to match the mention pattern: @{value}:[label](value:color@figId)
    const mentionRegex = /@([^:]+):\[([^\]]+)\]\(([^:]+):([^@]+)@([^)]+)\)/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }
      
      // Add mention
      parts.push({
        type: 'mention',
        content: `@${match[2]}`, // Display as @label
        mention: {
          label: match[2],
          value: match[3],
          color: match[4],
          figId: match[5],
        },
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }
    
    return parts;
  };

  const parts = parseMentions(text);

  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>;
        } else if (part.type === 'mention' && part.mention) {
          return (
            <span
              key={index}
              style={{
                backgroundColor: `${part.mention.color}20`,
                color: part.mention.color,
                borderRadius: '4px',
                padding: '0 2px',
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

