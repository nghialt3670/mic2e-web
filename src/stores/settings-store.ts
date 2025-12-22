import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsStore {
  llmModel: string;
  maxImageWidth: number;
  maxImageHeight: number;
  setLlmModel: (model: string) => void;
  setMaxImageWidth: (width: number) => void;
  setMaxImageHeight: (height: number) => void;
  resetToDefaults: () => void;
}

const DEFAULT_LLM_MODEL = "gemini-2.5-flash";
const DEFAULT_MAX_IMAGE_WIDTH = 480;
const DEFAULT_MAX_IMAGE_HEIGHT = 360;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      llmModel: DEFAULT_LLM_MODEL,
      maxImageWidth: DEFAULT_MAX_IMAGE_WIDTH,
      maxImageHeight: DEFAULT_MAX_IMAGE_HEIGHT,
      setLlmModel: (model: string) => set({ llmModel: model }),
      setMaxImageWidth: (width: number) => set({ maxImageWidth: width }),
      setMaxImageHeight: (height: number) => set({ maxImageHeight: height }),
      resetToDefaults: () =>
        set({
          llmModel: DEFAULT_LLM_MODEL,
          maxImageWidth: DEFAULT_MAX_IMAGE_WIDTH,
          maxImageHeight: DEFAULT_MAX_IMAGE_HEIGHT,
        }),
    }),
    {
      name: "mic2e-settings",
    },
  ),
);

export const LLM_MODELS = [
  { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
  { value: "gemini-2.5-flash", label: "gemini-2.5-flash" },
  { value: "gemini-2.5-flash-lite", label: "gemini-2.5-flash-lite" },
] as const;
