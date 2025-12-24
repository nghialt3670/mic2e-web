import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";

export interface SurveyOption {
  id: string;
  label: string;
  value: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  options: SurveyOption[];
}

export interface SurveyChat {
  id: string;
  title: string;
  questions: SurveyQuestion[];
}

export interface SurveySample {
  id: string;
  name: string;
  chats: SurveyChat[];
}

export interface SurveyAnswer {
  sampleId: string;
  chatId: string;
  questionId: string;
  optionId: string;
}

interface SurveyStore {
  templates: SurveyQuestion[];
  samples: SurveySample[];
  answers: Record<string, Record<string, Record<string, string>>>; // sampleId -> chatId -> questionId -> optionId
  addSample: (name: string) => string;
  updateSample: (sample: SurveySample) => void;
  removeSample: (sampleId: string) => void;
  addAnswer: (sampleId: string, chatId: string, questionId: string, optionId: string) => void;
  clearAnswers: (sampleId: string) => void;
}

const DEFAULT_OPTIONS: SurveyOption[] = [
  { id: uuid(), label: "Strongly disagree", value: "1" },
  { id: uuid(), label: "Disagree", value: "2" },
  { id: uuid(), label: "Neutral", value: "3" },
  { id: uuid(), label: "Agree", value: "4" },
  { id: uuid(), label: "Strongly agree", value: "5" },
];

const DEFAULT_TEMPLATES: SurveyQuestion[] = [
  {
    id: uuid(),
    text: "The assistant correctly understood the instruction.",
    options: DEFAULT_OPTIONS,
  },
  {
    id: uuid(),
    text: "The visual edits match the requested changes.",
    options: DEFAULT_OPTIONS,
  },
  {
    id: uuid(),
    text: "Overall satisfaction with the result.",
    options: DEFAULT_OPTIONS,
  },
];

// NOTE: this local store is no longer used for persistence.
// Survey data is now stored in the database via server actions.
// We keep defaults for UI templates (questions/options) in case
// the frontend needs them for quick starts.
export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES,
      samples: [],
      answers: {},
      addSample: () => "",
      updateSample: () => undefined,
      removeSample: () => undefined,
      addAnswer: () => undefined,
      clearAnswers: () => undefined,
    }),
    {
      name: "mic2e-survey-store",
    },
  ),
);
