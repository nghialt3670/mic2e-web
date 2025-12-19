export interface Chat2EditProgressEvent {
  type:
    | "request"
    | "prompt"
    | "answer"
    | "extract"
    | "execute"
    | "complete"
    | "error";
  message?: string;
  data?: Record<string, any>;
}
