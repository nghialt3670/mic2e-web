"use server";

import { revalidatePath } from "next/cache";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  chats,
  cycles,
  surveyAnswers,
  surveyChats,
  surveyOptions,
  surveyQuestions,
  surveySamples,
  type Chat,
  type SurveySample,
  type SurveyChat,
  type SurveyQuestion,
  type SurveyOption,
} from "@/lib/drizzle/drizzle-schema";
import { and, eq, asc } from "drizzle-orm";
import type { ChatDetails } from "@/types/chat-details";
import { getSessionUserId } from "@/utils/server/auth-utils";
import { v4 as uuid } from "uuid";

type TemplateQuestion = {
  id: string;
  text: string;
  options: Array<{ label: string; value: string; color?: string }>;
};

const SURVEY_PATHS = ["/survey", "/survey/config", "/survey/run"];

function revalidateSurvey() {
  SURVEY_PATHS.forEach((p) => revalidatePath(p));
}

export async function getSurveyTemplates(): Promise<TemplateQuestion[]> {
  const resultOptions = [
    { id: uuid(), label: "Achieved the desired result", value: "achieved", color: "green" },
    { id: uuid(), label: "Did not achieve the desired result", value: "not-achieved", color: "red" },
  ];

  const interactionOptions = [
    { id: uuid(), label: "1 = Very poor", value: "1", color: "red" },
    { id: uuid(), label: "2 = Poor", value: "2", color: "orange" },
    { id: uuid(), label: "3 = Acceptable", value: "3", color: "yellow" },
    { id: uuid(), label: "4 = Good", value: "4", color: "green" },
    { id: uuid(), label: "5 = Excellent", value: "5", color: "green" },
  ];

  return [
    {
      id: uuid(),
      text: "About Result: Did the assistant achieve the desired result that you requested? Please evaluate whether the final output matches your expectations and requirements.",
      options: resultOptions,
    },
    {
      id: uuid(),
      text: "About Interaction: How would you rate the overall quality of the interaction with the assistant? Consider factors such as clarity of communication, responsiveness, and helpfulness throughout the conversation.",
      options: interactionOptions,
    },
  ];
}

export async function listUserChats(): Promise<Pick<Chat, "id" | "title" | "updatedAt">[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];
  const rows = await drizzleClient
    .select({
      id: chats.id,
      title: chats.title,
      updatedAt: chats.updatedAt,
    })
    .from(chats)
    .where(eq(chats.userId, userId));
  return rows;
}

export async function getChatWithCycles(chatId: string): Promise<ChatDetails | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const chat = await drizzleClient.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    with: {
      cycles: {
        orderBy: asc(cycles.createdAt),
        with: {
          request: {
            with: {
              attachments: {
                with: { thumbnail: true },
              },
            },
          },
          response: {
            with: {
              attachments: {
                with: { thumbnail: true },
              },
            },
          },
          context: true,
        },
      },
    },
  });

  return chat as ChatDetails | null;
}

export async function listSurveySamples(): Promise<
  Array<
    SurveySample & {
      chats: Array<
        SurveyChat & {
          questions: Array<SurveyQuestion & { options: SurveyOption[] }>;
        }
      >;
    }
  >
> {
  const userId = await getSessionUserId();
  if (!userId) {
    return [];
  }

  const samples = await drizzleClient.query.surveySamples.findMany({
    where: eq(surveySamples.userId, userId),
    with: {
      chats: {
        orderBy: asc(surveyChats.sortOrder),
        with: {
          questions: {
            orderBy: asc(surveyQuestions.sortOrder),
            with: {
              options: {
                orderBy: asc(surveyOptions.sortOrder),
              },
            },
          },
        },
      },
      answers: true,
    },
  });

  // shape matches return type
  return samples as any;
}

export async function getSurveyProgress(): Promise<number> {
  const userId = await getSessionUserId();
  if (!userId) return 0;

  const samples = await drizzleClient.query.surveySamples.findMany({
    where: eq(surveySamples.userId, userId),
    with: {
      chats: {
        with: {
          questions: true,
        },
      },
      answers: true,
    },
  });

  let totalQuestions = 0;
  let answeredQuestions = 0;

  samples.forEach((sample) => {
    sample.chats.forEach((chat) => {
      chat.questions.forEach((q) => {
        totalQuestions++;
        const hasAnswer = sample.answers?.some(
          (ans) => ans.chatId === chat.id && ans.questionId === q.id,
        );
        if (hasAnswer) {
          answeredQuestions++;
        }
      });
    });
  });

  if (totalQuestions === 0) return 0;
  return Math.round((answeredQuestions / totalQuestions) * 100);
}

export async function getSurveySampleCount(): Promise<number> {
  const userId = await getSessionUserId();
  if (!userId) return 0;

  const samples = await drizzleClient.query.surveySamples.findMany({
    where: eq(surveySamples.userId, userId),
  });

  return samples.length;
}

export async function createSurveySample(name: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");
  const id = uuid();
  await drizzleClient.insert(surveySamples).values({
    id,
    userId,
    name: name || "New sample",
  });
  revalidateSurvey();
  return id;
}

export async function deleteSurveySample(sampleId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");
  await drizzleClient
    .delete(surveySamples)
    .where(and(eq(surveySamples.id, sampleId), eq(surveySamples.userId, userId)));
  revalidateSurvey();
}

export async function addSurveyChat(sampleId: string, chatId: string, title: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const sample = await drizzleClient.query.surveySamples.findFirst({
    where: and(eq(surveySamples.id, sampleId), eq(surveySamples.userId, userId)),
  });
  if (!sample) throw new Error("Sample not found");

  const sortOrder =
    (await drizzleClient
      .select({ count: surveyChats.id })
      .from(surveyChats)
      .where(eq(surveyChats.sampleId, sampleId)))[0]?.count ?? 0;

  const id = uuid();
  await drizzleClient.insert(surveyChats).values({
    id,
    sampleId,
    sourceChatId: chatId,
    title: title || "Untitled chat",
    sortOrder: Number(sortOrder) || 0,
  });
  revalidateSurvey();
  return id;
}

export async function addSurveyQuestion(chatId: string, text: string, options: Array<{ label: string; value: string }>) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const chat = await drizzleClient.query.surveyChats.findFirst({
    where: eq(surveyChats.id, chatId),
    with: {
      sample: true,
    },
  });
  if (!chat || chat.sample.userId !== userId) throw new Error("Chat not found");

  const sortOrder =
    (await drizzleClient
      .select({ count: surveyQuestions.id })
      .from(surveyQuestions)
      .where(eq(surveyQuestions.chatId, chatId)))[0]?.count ?? 0;

  const questionId = uuid();
  await drizzleClient.insert(surveyQuestions).values({
    id: questionId,
    chatId,
    text: text || "Question",
    sortOrder: Number(sortOrder) || 0,
  });

  const optionRows = options.map((opt, idx) => ({
    id: uuid(),
    questionId,
    label: opt.label,
    value: opt.value,
    sortOrder: idx,
  }));
  if (optionRows.length > 0) {
    await drizzleClient.insert(surveyOptions).values(optionRows);
  }
  revalidateSurvey();
  return questionId;
}

export async function addSurveyOption(questionId: string, label: string, value?: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const question = await drizzleClient.query.surveyQuestions.findFirst({
    where: eq(surveyQuestions.id, questionId),
    with: {
      chat: {
        with: { sample: true },
      },
    },
  });
  if (!question || question.chat.sample.userId !== userId) throw new Error("Question not found");

  const sortOrder =
    (await drizzleClient
      .select({ count: surveyOptions.id })
      .from(surveyOptions)
      .where(eq(surveyOptions.questionId, questionId)))[0]?.count ?? 0;

  const optionId = uuid();
  await drizzleClient.insert(surveyOptions).values({
    id: optionId,
    questionId,
    label: label || "Option",
    value: value || optionId,
    sortOrder: Number(sortOrder) || 0,
  });
  revalidateSurvey();
  return optionId;
}

export async function saveSurveyAnswer(
  sampleId: string,
  chatId: string,
  questionId: string,
  optionId: string,
) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  // Upsert-like: delete existing then insert
  await drizzleClient
    .delete(surveyAnswers)
    .where(
      and(
        eq(surveyAnswers.userId, userId),
        eq(surveyAnswers.questionId, questionId),
      ),
    );

  await drizzleClient.insert(surveyAnswers).values({
    id: uuid(),
    userId,
    sampleId,
    chatId,
    questionId,
    optionId,
  });

  revalidateSurvey();
}
