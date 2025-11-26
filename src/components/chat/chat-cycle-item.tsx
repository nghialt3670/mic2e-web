import { ChatCycleDetail } from "@/types/chat-cycle-detail";
import { FC } from "react";

import { MessageSkeleton } from "@/components/chat/message-skeleton";
import { MessageItem } from "./message-item";
import { PromptCycle } from "./prompt-cycle-item";
import { PromptCycleList } from "./prompt-cycle-list";

interface ChatCycleItemProps {
  chatCycle: ChatCycleDetail;
  showResponseSkeleton?: boolean;
}

interface ChatCycleDataJson {
  cycles?: PromptCycle[];
}

export const ChatCycleItem: FC<ChatCycleItemProps> = ({
  chatCycle,
  showResponseSkeleton = false,
}) => {
  const { requestMessage, responseMessage, dataJson } = chatCycle;

  // Extract cycles from dataJson
  const data = dataJson as ChatCycleDataJson | null;
  const cycles = data?.cycles || [];

  return (
    <div className="flex flex-col justify-start items-center h-full w-full overflow-y-scroll pr-2 pl-6">
      <div className="max-w-5xl w-full">
        <MessageItem message={requestMessage} />
      </div>

      {cycles.length > 0 && (
        <div className="w-full flex justify-center">
          <PromptCycleList cycles={cycles} />
        </div>
      )}

      <div className="max-w-5xl w-full">
        {responseMessage ? (
          <MessageItem message={responseMessage} />
        ) : (
          showResponseSkeleton && <MessageSkeleton />
        )}
      </div>
    </div>
  );
};
