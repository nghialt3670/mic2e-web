import { createContext } from "react";

type CursorContextType = {
  chatCursor: string | undefined;
};

export const CursorContext = createContext<CursorContextType>({
  chatCursor: undefined,
});
