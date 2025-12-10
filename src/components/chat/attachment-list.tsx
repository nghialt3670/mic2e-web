import { AnimatePresence, motion } from "framer-motion";
import { FC } from "react";

import { AttachmentDetail } from "../../types";
import { AttachmentItem } from "./attachment-item";

interface MessageAttachmentListProps {
  attachments: AttachmentDetail[];
}
export const MessageAttachmentList: FC<MessageAttachmentListProps> = ({
  attachments,
}) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence mode="popLayout">
        {attachments.map((attachment) => (
          <motion.div
            key={attachment.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            layout
          >
            <AttachmentItem attachment={attachment} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
