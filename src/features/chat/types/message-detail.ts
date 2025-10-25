import { AttachmentDetail } from "./attachment-detail";
import { Message } from "@/lib/drizzle/drizzle-schema";

export interface MessageDetail extends Message {
  attachments?: AttachmentDetail[];
}