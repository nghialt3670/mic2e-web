import { useUploadAttachmentStore } from "../../stores/upload-attachment-store";
import { UploadAttachmentItem } from "../upload-attachment-item";
import { AnimatePresence, motion } from "framer-motion";

export const UploadAttachmentList = () => {
  const { files } = useUploadAttachmentStore();

  return (
    <div className="flex flex-wrap gap-2 pb-2">
      <AnimatePresence mode="popLayout">
        {files.map((file) => (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            layout
          >
            <UploadAttachmentItem
              file={file}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
