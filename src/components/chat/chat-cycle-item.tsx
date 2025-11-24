import { ChatCycleDetail } from "@/types/chat-cycle-detail";
import { FC } from "react";

import { MessageItem } from "./message-item";

interface ChatCycleItemProps {
  chatCycle: ChatCycleDetail;
}

export const ChatCycleItem: FC<ChatCycleItemProps> = ({ chatCycle }) => {
  const { requestMessage, responseMessage } = chatCycle;

  return (
    <div className="flex flex-col justify-start items-center h-full w-full overflow-y-scroll pr-2 pl-6">
      <div className="max-w-5xl w-full">
        <MessageItem message={requestMessage} />
      </div>
      {responseMessage && (
        <div className="max-w-5xl w-full">
          <MessageItem message={responseMessage} />
        </div>
      )}
    </div>
  );
};
