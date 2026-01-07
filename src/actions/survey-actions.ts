"use server";

import { revalidatePath } from "next/cache";

import { drizzleClient } from "@/lib/drizzle/drizzle-client";
import {
  chats,
  cycles,
  questionTemplates,
  questionTemplateOptions,
  surveyAnswers,
  surveyChats,
  surveyOptions,
  surveyQuestions,
  surveySamples,
  surveySamplePreferences,
  type Chat,
  type QuestionTemplate,
  type QuestionTemplateOption,
  type SurveySample,
  type SurveyChat,
  type SurveyQuestion,
  type SurveyOption,
} from "@/lib/drizzle/drizzle-schema";
import { and, eq, asc, isNull } from "drizzle-orm";
import type { ChatDetails } from "@/types/chat-details";
import { getSessionUserId } from "@/utils/server/auth-utils";
import { v4 as uuid } from "uuid";


const SURVEY_PATHS = ["/survey", "/survey/config", "/survey/run"];

function revalidateSurvey() {
  SURVEY_PATHS.forEach((p) => revalidatePath(p));
}

// Migration function to migrate existing questions to templates
export async function migrateQuestionsToTemplates() {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  // Get all questions without templates
  const questionsWithoutTemplates = await drizzleClient.query.surveyQuestions.findMany({
    where: isNull(surveyQuestions.templateId),
  });

  // Ensure default templates exist
  await getSurveyTemplates();

  // Get default templates
  const templates = await drizzleClient.query.questionTemplates.findMany({
    with: {
      options: {
        orderBy: asc(questionTemplateOptions.sortOrder),
      },
    },
  });

  for (const question of questionsWithoutTemplates) {
    if (!question.text || !question.text.trim()) continue;

    const questionText = question.text; // Store in const for type narrowing

    // Try to match by text
    let matchedTemplate = templates.find((t) => {
      const qText = questionText.toLowerCase();
      const tText = t.text.toLowerCase();
      return qText.includes(tText.substring(0, 30)) || tText.includes(qText.substring(0, 30));
    });

    // If no match, create a new template from the question
    if (!matchedTemplate) {
      const templateId = uuid();
      await drizzleClient.insert(questionTemplates).values({
        id: templateId,
        text: questionText,
      });

      // Copy options from survey options
      const questionOptions = await drizzleClient.query.surveyOptions.findMany({
        where: eq(surveyOptions.questionId, question.id),
        orderBy: asc(surveyOptions.sortOrder),
      });

      if (questionOptions.length > 0) {
        await drizzleClient.insert(questionTemplateOptions).values(
          questionOptions.map((opt, idx) => ({
            id: uuid(),
            templateId,
            label: opt.label,
            value: opt.value,
            sortOrder: idx,
          })),
        );
      }

      matchedTemplate = await drizzleClient.query.questionTemplates.findFirst({
        where: eq(questionTemplates.id, templateId),
        with: {
          options: {
            orderBy: asc(questionTemplateOptions.sortOrder),
          },
        },
      });
    }

    if (matchedTemplate) {
      // Update question to reference template
      await drizzleClient
        .update(surveyQuestions)
        .set({ templateId: matchedTemplate.id })
        .where(eq(surveyQuestions.id, question.id));
    }
  }

  revalidateSurvey();
}

export async function getSurveyTemplates(): Promise<
  Array<QuestionTemplate & { options: QuestionTemplateOption[] }>
> {
  // Fetch all question templates
  let templates = await drizzleClient.query.questionTemplates.findMany({
    with: {
      options: {
        orderBy: asc(questionTemplateOptions.sortOrder),
      },
    },
  });

  // Initialize default templates if none exist
  if (templates.length === 0) {
    // Create "About Result" template
    const resultTemplateId = uuid();
    await drizzleClient.insert(questionTemplates).values({
      id: resultTemplateId,
      text: "About Result: Did the assistant achieve the desired result that you requested?",
    });
    await drizzleClient.insert(questionTemplateOptions).values([
      { id: uuid(), templateId: resultTemplateId, label: "Achieved the desired result", value: "achieved", sortOrder: 0 },
      { id: uuid(), templateId: resultTemplateId, label: "Did not achieve the desired result", value: "not-achieved", sortOrder: 1 },
    ]);

    // Create "About Interaction" template
    const interactionTemplateId = uuid();
    await drizzleClient.insert(questionTemplates).values({
      id: interactionTemplateId,
      text: "About Interaction: How would you rate the overall quality of the interaction with the assistant?",
    });
    await drizzleClient.insert(questionTemplateOptions).values([
      { id: uuid(), templateId: interactionTemplateId, label: "1 = Very poor", value: "1", sortOrder: 0 },
      { id: uuid(), templateId: interactionTemplateId, label: "2 = Poor", value: "2", sortOrder: 1 },
      { id: uuid(), templateId: interactionTemplateId, label: "3 = Acceptable", value: "3", sortOrder: 2 },
      { id: uuid(), templateId: interactionTemplateId, label: "4 = Good", value: "4", sortOrder: 3 },
      { id: uuid(), templateId: interactionTemplateId, label: "5 = Excellent", value: "5", sortOrder: 4 },
    ]);

    // Fetch templates again
    templates = await drizzleClient.query.questionTemplates.findMany({
      with: {
        options: {
          orderBy: asc(questionTemplateOptions.sortOrder),
        },
      },
    });
  }

  return templates as any;
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

  // For survey mode: load chat without userId check (public access)
  // This allows any user to view chats that are part of survey samples
  const chat = await drizzleClient.query.chats.findFirst({
    where: eq(chats.id, chatId),
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
          questions: Array<
            SurveyQuestion & {
              template: (QuestionTemplate & { options: QuestionTemplateOption[] }) | null;
              options: SurveyOption[];
            }
          >;
        }
      >;
    }
  >
> {
  const userId = await getSessionUserId();
  if (!userId) {
    return [];
  }

  // Fetch all samples (public), but only the current user's answers
  const samples = await drizzleClient.query.surveySamples.findMany({
    with: {
      chats: {
        orderBy: asc(surveyChats.sortOrder),
        with: {
          questions: {
            orderBy: asc(surveyQuestions.sortOrder),
            with: {
              template: {
                with: {
                  options: {
                    orderBy: asc(questionTemplateOptions.sortOrder),
                  },
                },
              },
              options: {
                orderBy: asc(surveyOptions.sortOrder),
              },
            },
          },
        },
      },
      answers: {
        where: eq(surveyAnswers.userId, userId),
      },
    },
  });

  // shape matches return type
  return samples as any;
}

export async function getSurveyProgress(): Promise<number> {
  const userId = await getSessionUserId();
  if (!userId) return 0;

  // Get all samples (public) but only current user's answers
  const samples = await drizzleClient.query.surveySamples.findMany({
    with: {
      chats: {
        with: {
          questions: true,
        },
      },
      answers: {
        where: eq(surveyAnswers.userId, userId),
      },
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

  // Count all samples (public)
  const samples = await drizzleClient.query.surveySamples.findMany({});

  return samples.length;
}

export async function getTotalResponseCount(): Promise<number> {
  const userId = await getSessionUserId();
  if (!userId) return 0;

  // Count all survey answers across all users
  const answers = await drizzleClient.query.surveyAnswers.findMany({});

  return answers.length;
}

export async function getSurveyStats() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  // Get all samples with their answers
  const samples = await drizzleClient.query.surveySamples.findMany({
    with: {
      chats: {
        with: {
          questions: {
            with: {
              template: {
                with: {
                  options: true,
                },
              },
              options: true,
            },
          },
        },
      },
      answers: true,
    },
  });

  // Get all sample-level chat preferences
  const preferenceRows = await drizzleClient
    .select({
      sampleId: surveySamplePreferences.sampleId,
      preferredChatId: surveySamplePreferences.preferredChatId,
    })
    .from(surveySamplePreferences);

  const preferenceCountsBySample: Record<string, Record<string, number>> = {};
  for (const row of preferenceRows) {
    if (!preferenceCountsBySample[row.sampleId]) {
      preferenceCountsBySample[row.sampleId] = {};
    }
    const chatCounts = preferenceCountsBySample[row.sampleId];
    chatCounts[row.preferredChatId] = (chatCounts[row.preferredChatId] || 0) + 1;
  }

  // Collect all unique users first
  const allUsers = new Set<string>();
  samples.forEach((sample) => {
    (sample.answers || []).forEach((a) => allUsers.add(a.userId));
  });

  // Calculate statistics
  const sampleStats = samples.map((sample) => {
    const sampleAnswers = sample.answers || [];
    const uniqueUsers = new Set(sampleAnswers.map((a) => a.userId));
    
    // Group questions by chat
    const chatStats = sample.chats.map((chat) => {
      const questionStats = chat.questions.map((question) => {
        const questionAnswers = sampleAnswers.filter((a) => a.questionId === question.id);
        
        // Use template options if available, otherwise use survey options
        const templateOptions = question.template?.options || [];
        const optionCounts = templateOptions.length > 0
          ? templateOptions.map((templateOpt) => {
              // Find matching survey option by value
              const matchingOption = question.options.find((opt) => opt.value === templateOpt.value);
              return {
                label: templateOpt.label,
                value: templateOpt.value,
                count: matchingOption 
                  ? questionAnswers.filter((a) => a.optionId === matchingOption.id).length 
                  : 0,
              };
            })
          : question.options.map((opt) => ({
              label: opt.label,
              value: opt.value,
              count: questionAnswers.filter((a) => a.optionId === opt.id).length,
            }));

        return {
          id: question.id,
          text: question.template?.text || question.text || "Question",
          totalAnswers: questionAnswers.length,
          options: optionCounts,
        };
      });

      const prefCountsForSample = preferenceCountsBySample[sample.id] || {};

      return {
        id: chat.id,
        title: chat.title,
        sourceChatId: chat.sourceChatId,
        questions: questionStats,
        preferredCount: prefCountsForSample[chat.id] ?? 0,
      };
    });

    return {
      id: sample.id,
      name: sample.name,
      responseCount: uniqueUsers.size,
      chats: chatStats,
    };
  });

  return {
    totalSamples: samples.length,
    totalResponses: allUsers.size,
    totalUsers: allUsers.size,
    sampleStats,
  };
}

export async function createQuestionTemplate(
  text: string,
  options: Array<{ label: string; value: string }>,
) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const templateId = uuid();
  await drizzleClient.insert(questionTemplates).values({
    id: templateId,
    text,
  });

  const optionRows = options.map((opt, idx) => ({
    id: uuid(),
    templateId,
    label: opt.label,
    value: opt.value,
    sortOrder: idx,
  }));

  if (optionRows.length > 0) {
    await drizzleClient.insert(questionTemplateOptions).values(optionRows);
  }

  revalidateSurvey();
  return templateId;
}

export async function updateQuestionTemplate(
  templateId: string,
  text: string,
) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  await drizzleClient
    .update(questionTemplates)
    .set({ text })
    .where(eq(questionTemplates.id, templateId));

  revalidateSurvey();
}

export async function deleteQuestionTemplate(templateId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  // This will cascade delete options and set survey questions to null (restrict)
  await drizzleClient
    .delete(questionTemplates)
    .where(eq(questionTemplates.id, templateId));

  revalidateSurvey();
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
  // Anyone can delete public samples
  await drizzleClient
    .delete(surveySamples)
    .where(eq(surveySamples.id, sampleId));
  revalidateSurvey();
}

export async function addSurveyChat(sampleId: string, chatId: string, title: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  // Anyone can add chats to public samples
  const sample = await drizzleClient.query.surveySamples.findFirst({
    where: eq(surveySamples.id, sampleId),
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

export async function addSurveyQuestion(chatId: string, templateId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  // Anyone can add questions to public samples
  const chat = await drizzleClient.query.surveyChats.findFirst({
    where: eq(surveyChats.id, chatId),
  });
  if (!chat) throw new Error("Chat not found");

  // Fetch template with options
  const template = await drizzleClient.query.questionTemplates.findFirst({
    where: eq(questionTemplates.id, templateId),
    with: {
      options: {
        orderBy: asc(questionTemplateOptions.sortOrder),
      },
    },
  });
  if (!template) throw new Error("Template not found");

  const sortOrder =
    (await drizzleClient
      .select({ count: surveyQuestions.id })
      .from(surveyQuestions)
      .where(eq(surveyQuestions.chatId, chatId)))[0]?.count ?? 0;

  const questionId = uuid();
  await drizzleClient.insert(surveyQuestions).values({
    id: questionId,
    chatId,
    templateId,
    sortOrder: Number(sortOrder) || 0,
  });

  // Copy template options to survey options
  const optionRows = template.options.map((opt, idx) => ({
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

  // Anyone can add options to public samples
  const question = await drizzleClient.query.surveyQuestions.findFirst({
    where: eq(surveyQuestions.id, questionId),
  });
  if (!question) throw new Error("Question not found");

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

export async function updateSurveyQuestionText(questionId: string, text: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  // Anyone can update questions in public samples
  const question = await drizzleClient.query.surveyQuestions.findFirst({
    where: eq(surveyQuestions.id, questionId),
  });
  if (!question) throw new Error("Question not found");

  await drizzleClient
    .update(surveyQuestions)
    .set({ text: text.trim() || null })
    .where(eq(surveyQuestions.id, questionId));

  revalidateSurvey();
}

export async function deleteSurveyQuestion(questionId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  // Anyone can delete questions from public samples
  const question = await drizzleClient.query.surveyQuestions.findFirst({
    where: eq(surveyQuestions.id, questionId),
  });
  if (!question) throw new Error("Question not found");

  // This will cascade delete options and answers
  await drizzleClient
    .delete(surveyQuestions)
    .where(eq(surveyQuestions.id, questionId));

  revalidateSurvey();
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

export async function saveSurveySamplePreference(
  sampleId: string,
  preferredChatId: string,
): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  // Delete any existing preference for this user+sample, then insert new one
  await drizzleClient
    .delete(surveySamplePreferences)
    .where(
      and(
        eq(surveySamplePreferences.userId, userId),
        eq(surveySamplePreferences.sampleId, sampleId),
      ),
    );

  const id = uuid();
  await drizzleClient
    .insert(surveySamplePreferences)
    .values({
      id,
      userId,
      sampleId,
      preferredChatId,
    })
    .returning();

  revalidateSurvey();
}

export async function getSurveySamplePreference(
  sampleId: string,
): Promise<{ preferredChatId: string } | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const rows = await drizzleClient
    .select({
      preferredChatId: surveySamplePreferences.preferredChatId,
    })
    .from(surveySamplePreferences)
    .where(
      and(
        eq(surveySamplePreferences.userId, userId),
        eq(surveySamplePreferences.sampleId, sampleId),
      ),
    )
    .limit(1);

  if (!rows[0]) return null;
  return { preferredChatId: rows[0].preferredChatId };
}
