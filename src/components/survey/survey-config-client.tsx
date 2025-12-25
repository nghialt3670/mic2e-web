"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { SampleBuilder } from "@/components/survey/sample-builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addSurveyChat,
  addSurveyOption,
  addSurveyQuestion,
  createSurveySample,
  deleteSurveySample,
  listSurveySamples,
  updateSurveyQuestionText,
  deleteSurveyQuestion,
} from "@/actions/survey-actions";

import type {
  QuestionTemplate,
  QuestionTemplateOption,
  SurveyAnswer,
  SurveyChat,
  SurveyOption,
  SurveyQuestion,
  SurveySample,
} from "@/lib/drizzle/drizzle-schema";

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

interface SurveyConfigClientProps {
  initialSamples: SampleWithContent[];
  templates: Array<QuestionTemplate & { options: QuestionTemplateOption[] }>;
  availableChats: Array<{ id: string; title: string | null; updatedAt: Date | null }>;
}

export function SurveyConfigClient({
  initialSamples,
  templates,
  availableChats,
}: SurveyConfigClientProps) {
  const [samples, setSamples] = useState<SampleWithContent[]>(initialSamples);
  const [newSampleName, setNewSampleName] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const refresh = async () => {
    const data = await listSurveySamples();
    setSamples(data as SampleWithContent[]);
    router.refresh();
  };

  const handleAddSample = () => {
    startTransition(async () => {
      await createSurveySample(newSampleName.trim() || "New sample");
      setNewSampleName("");
      await refresh();
    });
  };

  const handleRemoveSample = (sampleId: string) => {
    startTransition(async () => {
      await deleteSurveySample(sampleId);
      await refresh();
    });
  };

  const handleAddChat = (sampleId: string, chatId: string, title: string) => {
    if (!chatId || !title.trim()) return;
    startTransition(async () => {
      await addSurveyChat(sampleId, chatId, title.trim());
      await refresh();
    });
  };

  const handleAddQuestionFromTemplate = (
    chatId: string,
    templateId: string,
  ) => {
    startTransition(async () => {
      await addSurveyQuestion(chatId, templateId);
      await refresh();
    });
  };

  const handleAddOption = (questionId: string, label: string, value?: string) => {
    startTransition(async () => {
      await addSurveyOption(questionId, label, value);
      await refresh();
    });
  };

  const handleUpdateQuestionText = (questionId: string, text: string) => {
    startTransition(async () => {
      await updateSurveyQuestionText(questionId, text);
      await refresh();
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    startTransition(async () => {
      await deleteSurveyQuestion(questionId);
      await refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Survey configuration</h1>
          <p className="text-muted-foreground">
            Create samples, add chats, and attach questions/options for surveys.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="New sample name"
            value={newSampleName}
            onChange={(e) => setNewSampleName(e.target.value)}
          />
          <Button onClick={handleAddSample} disabled={pending}>
            Add sample
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {samples.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No samples yet</CardTitle>
              <CardDescription>Add a sample to get started.</CardDescription>
            </CardHeader>
          </Card>
        )}

        {samples.map((sample) => {
          const totalQuestions = sample.chats.reduce(
            (acc, c) => acc + c.questions.length,
            0,
          );
          return (
            <Card key={sample.id} className="border-primary/20">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle>{sample.name}</CardTitle>
                  <CardDescription>
                    {sample.chats.length} chat(s) • {totalQuestions} question(s)
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSample(sample.id)}
                  disabled={pending}
                >
                  Remove
                </Button>
              </CardHeader>
              <CardContent>
                <SampleBuilder
                  sample={sample}
                  templates={templates}
                  availableChats={availableChats}
                  onAddChat={handleAddChat}
                  onAddQuestionFromTemplate={handleAddQuestionFromTemplate}
                  onAddOption={handleAddOption}
                  onUpdateQuestionText={handleUpdateQuestionText}
                  onDeleteQuestion={handleDeleteQuestion}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
