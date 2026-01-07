"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatContext } from "@/contexts/chat-context";
import { CycleList } from "@/components/chat/cycle-list";
import type { ChatDetails } from "@/types/chat-details";

interface OptionStat {
  label: string;
  value: string;
  count: number;
}

interface QuestionStat {
  id: string;
  text: string;
  totalAnswers: number;
  options: OptionStat[];
}

interface ChatStat {
  id: string;
  title: string;
  sourceChatId: string | null;
  questions: QuestionStat[];
  preferredCount?: number;
}

interface SampleStat {
  id: string;
  name: string;
  responseCount: number;
  chats: ChatStat[];
}

interface SurveyStats {
  totalSamples: number;
  totalResponses: number;
  totalUsers: number;
  sampleStats: SampleStat[];
}

interface SurveyDashboardProps {
  stats: SurveyStats;
  chatDetailsById: Record<string, ChatDetails>;
}

export const SurveyDashboard = ({ stats, chatDetailsById }: SurveyDashboardProps) => {
  return (
    <div className="space-y-6 py-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Samples</CardTitle>
            <CardDescription>Number of survey samples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalSamples}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Unique participants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Responses</CardTitle>
            <CardDescription>All survey answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalResponses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Details */}
      {stats.sampleStats.map((sample) => (
        <Card key={sample.id}>
          <CardHeader>
            <CardTitle>{sample.name}</CardTitle>
            <CardDescription>
              {sample.responseCount} responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {sample.chats.map((chat) => (
                <div key={chat.id} className="flex-1 min-w-[800px] border rounded-lg p-4 bg-card space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm font-medium">{chat.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Preferred by {chat.preferredCount ?? 0} user{(chat.preferredCount ?? 0) === 1 ? "" : "s"}
                    </div>
                  </div>

                  {/* Chat Content */}
                  {chat.sourceChatId && chatDetailsById[chat.sourceChatId] && (
                    <div className="rounded-md border bg-muted/30 p-3 h-[300px] overflow-y-auto">
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
                    {chat.questions.map((question) => {
                      const totalVotes = question.options.reduce((sum, opt) => sum + opt.count, 0);
                      
                      return (
                        <div key={question.id} className="flex-1 min-w-[350px] max-h-[400px] flex flex-col p-4 border rounded-lg bg-background">
                          <div className="space-y-1 shrink-0">
                            <h4 className="text-sm font-medium leading-relaxed">{question.text}</h4>
                            <p className="text-xs text-muted-foreground">{question.totalAnswers} answers</p>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto pr-1 mt-3 space-y-2">
                            {question.options.map((option) => {
                              const percentage = totalVotes > 0 ? Math.round((option.count / totalVotes) * 100) : 0;
                              
                              // Determine color based on option label
                              let colorClass = "bg-blue-500";
                              const lowerLabel = option.label.toLowerCase();
                              if (lowerLabel.includes("achieved") || lowerLabel.includes("excellent") || lowerLabel.includes("good") || option.value === "4" || option.value === "5") {
                                colorClass = "bg-green-500";
                              } else if (lowerLabel.includes("not achieve") || lowerLabel.includes("very poor") || option.value === "1") {
                                colorClass = "bg-red-500";
                              } else if (lowerLabel.includes("poor") || option.value === "2") {
                                colorClass = "bg-orange-500";
                              } else if (lowerLabel.includes("acceptable") || option.value === "3") {
                                colorClass = "bg-yellow-500";
                              }

                              return (
                                <div key={option.label} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm gap-2">
                                    <span className="leading-relaxed">{option.label}</span>
                                    <span className="text-muted-foreground whitespace-nowrap">
                                      {option.count} ({percentage}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                      className={`h-full ${colorClass} transition-all duration-500`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
