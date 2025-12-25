"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type {
  QuestionTemplate,
  QuestionTemplateOption,
  SurveyChat,
  SurveyOption,
  SurveyQuestion,
  SurveySample,
} from "@/lib/drizzle/drizzle-schema";

interface SampleBuilderProps {
  sample: SurveySample & {
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
  };
  templates: Array<QuestionTemplate & { options: QuestionTemplateOption[] }>;
  availableChats: Array<{ id: string; title: string | null; updatedAt: Date | null }>;
  onAddChat: (sampleId: string, chatId: string, title: string) => void;
  onAddQuestionFromTemplate: (chatId: string, templateId: string) => void;
  onAddOption: (questionId: string, label: string, value?: string) => void;
  onUpdateQuestionText: (questionId: string, text: string) => void;
  onDeleteQuestion: (questionId: string) => void;
}

export const SampleBuilder = ({
  sample,
  templates,
  availableChats,
  onAddChat,
  onAddQuestionFromTemplate,
  onAddOption,
  onUpdateQuestionText,
  onDeleteQuestion,
}: SampleBuilderProps) => {
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [questionTexts, setQuestionTexts] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{sample.name}</CardTitle>
          <CardDescription>Chats and questions for this sample.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 items-center">
            <Label className="w-28">Select chat</Label>
            <select
              className="flex-1 border rounded-md px-2 py-1 text-sm"
              value={selectedChatId}
              onChange={(e) => setSelectedChatId(e.target.value)}
            >
              <option value="">Choose from chats...</option>
              {availableChats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || "Untitled"} ({c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : ""})
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => {
                const chosen = availableChats.find((c) => c.id === selectedChatId);
                if (!chosen) return;
                onAddChat(sample.id, chosen.id, chosen.title || "Untitled chat");
                setSelectedChatId("");
              }}
              disabled={!selectedChatId}
            >
              Add selected
            </Button>
          </div>

          {sample.chats.map((chat) => (
            <Card key={chat.id}>
              <CardHeader>
                <CardTitle className="text-sm">{chat.title}</CardTitle>
                <CardDescription>Add questions for this chat.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onAddQuestionFromTemplate(chat.id, template.id)
                      }
                    >
                      Add “{template.text}”
                    </Button>
                  ))}
                </div>

                {chat.questions.map((question) => {
                  const questionId = question.id;
                  const currentText = questionTexts[questionId] ?? (question.template?.text || question.text || "");
                  
                  return (
                    <div key={question.id} className="space-y-2 border rounded-md p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <Label>Question</Label>
                          <Textarea
                            value={currentText}
                            onChange={(e) => {
                              setQuestionTexts((prev) => ({
                                ...prev,
                                [questionId]: e.target.value,
                              }));
                            }}
                            onBlur={(e) => {
                              const newText = e.target.value.trim();
                              const templateText = question.template?.text || "";
                              const currentText = question.text || "";
                              const originalText = currentText || templateText;
                              
                              // Only save if text changed
                              if (newText !== originalText) {
                                onUpdateQuestionText(questionId, newText);
                              }
                            }}
                            placeholder="Enter question text..."
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteQuestion(question.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAddOption(question.id, "Option")}
                        >
                          Add option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center gap-2">
                            <Input value={option.label} disabled />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
