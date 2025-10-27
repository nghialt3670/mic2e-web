import { Message } from "@/lib/drizzle/drizzle-schema";

import { AttachmentDetail } from "./attachment-detail";

export interface MessageDetail extends Message {
  attachments: AttachmentDetail[];
}
