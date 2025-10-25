import { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { MessageAttachmentItem } from "../message-attachment-item";
import { AttachmentDetail } from "../../types";

interface MessageAttachmentListProps {
  attachments: AttachmentDetail[];
}
export const MessageAttachmentList: FC<MessageAttachmentListProps> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 pb-2">
      <AnimatePresence mode="popLayout">
        {attachments.map((attachment) => (
          <motion.div
            key={attachment.id || attachment.url}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            layout
          >
            <MessageAttachmentItem
              attachment={attachment}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
