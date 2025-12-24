import Link from "next/link";

import { getChatWithCycles, listSurveySamples } from "@/actions/survey-actions";
import { RunSurvey } from "@/components/survey/run-survey";
import { Button } from "@/components/ui/button";

export default async function SurveyRunPage() {
  const samples = await listSurveySamples();
  const chatIds = Array.from(
    new Set(
      samples
        .flatMap((s) => s.chats.map((c) => c.sourceChatId).filter(Boolean)) as string[],
    ),
  );
  const chatDetails = await Promise.all(chatIds.map((id) => getChatWithCycles(id)));
  const chatDetailsById = chatIds.reduce<Record<string, any>>((acc, id, idx) => {
    const chat = chatDetails[idx];
    if (chat) acc[id] = chat;
    return acc;
  }, {});

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-2xl font-semibold">Run survey</h1>
        <Link href="/survey">
          <Button variant="ghost">← Back to survey</Button>
        </Link>
      </div>
      <p className="text-muted-foreground px-4 pb-2 shrink-0">
        Answer questions for each chat.
      </p>

      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <RunSurvey initialSamples={samples as any} chatDetailsById={chatDetailsById} />
      </div>
    </div>
  );
}
