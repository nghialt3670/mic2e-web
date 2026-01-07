"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ChatContext } from "@/contexts/chat-context";
import { CycleList } from "@/components/chat/cycle-list";
import type { ChatDetails } from "@/types/chat-details";
import { saveSurveyAnswer, saveSurveySamplePreference } from "@/actions/survey-actions";
import type { QuestionTemplate, QuestionTemplateOption, SurveyAnswer, SurveyChat, SurveyOption, SurveyQuestion, SurveySample } from "@/lib/drizzle/drizzle-schema";

type AnswerMap = Record<string, Record<string, Record<string, string>>>;

type SampleWithContent = SurveySample & {
  chats: Array<
    SurveyChat & {
      questions: Array<
        SurveyQuestion & {
          template: (QuestionTemplate & { options: QuestionTemplateOption[] }) | null;
          options: SurveyOption[];
        }
      >;
    }
  >;
  answers?: SurveyAnswer[];
};

function buildAnswerMap(samples: SampleWithContent[]): AnswerMap {
  const map: AnswerMap = {};
  samples.forEach((sample) => {
    sample.answers?.forEach((ans) => {
      if (!map[sample.id]) map[sample.id] = {};
      if (!map[sample.id][ans.chatId]) map[sample.id][ans.chatId] = {};
      map[sample.id][ans.chatId][ans.questionId] = ans.optionId;
    });
  });
  return map;
}

interface RunSurveyProps {
  initialSamples: SampleWithContent[];
  chatDetailsById: Record<string, ChatDetails>;
}

export const RunSurvey = ({ initialSamples, chatDetailsById }: RunSurveyProps) => {
  const router = useRouter();
  const shuffled = useMemo(
    () => [...initialSamples].sort(() => Math.random() - 0.5),
    [initialSamples],
  );
  const [samples] = useState<SampleWithContent[]>(shuffled);
  const [answers, setAnswers] = useState<AnswerMap>(() => buildAnswerMap(initialSamples));
  const [isSaving, startSaving] = useTransition();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedSample = useMemo(() => samples[selectedIndex], [samples, selectedIndex]);
  const [preferences, setPreferences] = useState<Record<string, string>>({});

  const handleAnswerChange = (sampleId: string, chatId: string, questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [sampleId]: {
        ...(prev[sampleId] || {}),
        [chatId]: {
          ...(prev[sampleId]?.[chatId] || {}),
          [questionId]: optionId,
        },
      },
    }));

    startSaving(async () => {
      await saveSurveyAnswer(sampleId, chatId, questionId, optionId);
    });
  };

  const handlePreferenceChange = (sampleId: string, preferredChatId: string) => {
    setPreferences((prev) => ({
      ...prev,
      [sampleId]: preferredChatId,
    }));

    startSaving(async () => {
      await saveSurveySamplePreference(sampleId, preferredChatId);
    });
  };

  const isSampleComplete = (sample: SampleWithContent | undefined) => {
    if (!sample) return false;
    for (const chat of sample.chats) {
      for (const q of chat.questions) {
        const answered = answers[sample.id]?.[chat.id]?.[q.id];
        if (!answered) return false;
      }
    }
    return true;
  };

  const handleNextSample = () => {
    if (selectedIndex < samples.length - 1) {
      setSelectedIndex((i) => i + 1);
    }
  };

  const getOptionColor = (label: string, value: string): string => {
    const lowerLabel = label.toLowerCase();
    const lowerValue = value.toLowerCase();
    
    // Result options
    if (lowerLabel.includes("achieved") || lowerValue === "achieved") return "text-green-600";
    if (lowerLabel.includes("did not achieve") || lowerValue === "not-achieved") return "text-red-600";
    
    // Interaction options
    if (lowerLabel.includes("very poor") || value === "1") return "text-red-600";
    if (lowerLabel.includes("poor") || value === "2") return "text-orange-600";
    if (lowerLabel.includes("acceptable") || value === "3") return "text-yellow-600";
    if (lowerLabel.includes("good") || value === "4") return "text-green-600";
    if (lowerLabel.includes("excellent") || value === "5") return "text-green-600";
    
    return "text-foreground";
  };

  const progressPercentage = useMemo(() => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    samples.forEach((sample) => {
      sample.chats.forEach((chat) => {
        chat.questions.forEach((q) => {
          totalQuestions++;
          if (answers[sample.id]?.[chat.id]?.[q.id]) {
            answeredQuestions++;
          }
        });
      });
    });

    if (totalQuestions === 0) return 0;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  }, [samples, answers]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {selectedSample ? (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden pb-2">
          <div className="flex-1 flex gap-4 overflow-x-auto">
            {selectedSample.chats.map((chat) => (
              <div key={chat.id} className="flex-1 min-w-[800px] h-full flex flex-col border rounded-lg bg-card overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Chat Content */}
                  {chat.sourceChatId && chatDetailsById[chat.sourceChatId] && (
                    <div className="rounded-md border bg-muted/30 p-3">
                      <ChatContext.Provider
                        value={{
                          chat: chatDetailsById[chat.sourceChatId],
                          progressMessage: null,
                          hideProgressAndActions: true,
                        }}
                      >
                        <CycleList />
                      </ChatContext.Provider>
                    </div>
                  )}

                  {/* Questions for this chat */}
                  <div className="flex gap-3 overflow-x-auto">
                    {chat.questions.map((q, qIdx) => (
                      <div key={q.id} className="flex-1 min-w-[350px] flex flex-col p-4 border rounded-lg bg-background">
                        <div className="space-y-1 shrink-0">
                          <h4 className="text-sm font-medium leading-relaxed">
                            Q{qIdx + 1}. {q.template?.text || q.text || "Question"}
                          </h4>
                        </div>
                        <div className="mt-3 space-y-2">
                          <RadioGroup
                            value={answers[selectedSample.id]?.[chat.id]?.[q.id] || ""}
                            onValueChange={(optionId) =>
                              handleAnswerChange(selectedSample.id, chat.id, q.id, optionId)
                            }
                            className="space-y-2"
                          >
                            {q.options.map((opt) => (
                              <div key={opt.id} className="flex items-start space-x-2">
                                <RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} className="mt-1" />
                                <Label 
                                  htmlFor={`${q.id}-${opt.id}`} 
                                  className={`text-sm leading-relaxed cursor-pointer ${getOptionColor(opt.label, opt.value)}`}
                                >
                                  {opt.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sample-level preference: which chat do you prefer? */}
          <Card className="shrink-0">
            <CardHeader>
              <CardTitle className="text-sm">Overall preference</CardTitle>
              <CardDescription className="text-xs">
                Which chat do you prefer overall for this sample?
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-4">
              <RadioGroup
                value={preferences[selectedSample.id] || ""}
                onValueChange={(chatId) => handlePreferenceChange(selectedSample.id, chatId)}
                className="space-y-2"
              >
                {selectedSample.chats.map((chat, idx) => (
                  <div key={chat.id} className="flex items-start space-x-2">
                    <RadioGroupItem value={chat.id} id={`pref-${chat.id}`} className="mt-1" />
                    <Label htmlFor={`pref-${chat.id}`} className="text-sm leading-relaxed cursor-pointer">
                      Chat {idx + 1}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No sample selected</CardTitle>
            <CardDescription>Create a sample in the config page first.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Separator />

      <div className="flex items-center justify-between shrink-0 py-2">
        <div className="text-sm text-muted-foreground">
          Progress: <span className="font-semibold text-foreground">{progressPercentage}%</span> completed
        </div>
        <div>
          {selectedIndex < samples.length - 1 ? (
            <Button
              onClick={handleNextSample}
              disabled={!isSampleComplete(selectedSample) || isSaving}
            >
              {isSampleComplete(selectedSample) ? "Next sample" : "Complete all questions to continue"}
            </Button>
          ) : (
            <Button
              onClick={() => isSampleComplete(selectedSample) && router.push("/survey")}
              disabled={!isSampleComplete(selectedSample) || isSaving}
            >
              {isSampleComplete(selectedSample) ? "All responses saved" : "Complete all questions"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
