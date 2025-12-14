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

const DEFAULT_LLM_MODEL = "gpt-4o";
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
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku" },
] as const;
