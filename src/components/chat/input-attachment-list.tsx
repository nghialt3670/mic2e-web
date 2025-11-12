import { AnimatePresence, motion } from "framer-motion";

import { useInputAttachmentStore } from "../../stores/input-attachment-store";
import { InputAttachmentItem } from "./input-attachment-item";

export const InputAttachmentList = () => {
  const { getInputAttachments } = useInputAttachmentStore();
  const attachments = getInputAttachments();

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence mode="popLayout">
        {attachments.map((attachment) => (
          <motion.div
            key={attachment.imageFile.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            layout
          >
            <InputAttachmentItem attachment={attachment} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
