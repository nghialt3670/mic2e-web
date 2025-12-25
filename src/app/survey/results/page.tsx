import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSurveyStats, getChatWithCycles } from "@/actions/survey-actions";
import { SurveyDashboard } from "@/components/survey/survey-dashboard";

export default async function SurveyResultsPage() {
  const stats = await getSurveyStats();

  // Fetch chat details for all chats with sourceChatId
  let chatDetailsById = {};
  if (stats) {
    const chatIds = Array.from(
      new Set(
        stats.sampleStats
          .flatMap((s) => s.chats.map((c) => c.sourceChatId).filter(Boolean)) as string[],
      ),
    );
    const chatDetails = await Promise.all(chatIds.map((id) => getChatWithCycles(id)));
    chatDetailsById = chatIds.reduce<Record<string, any>>((acc, id, idx) => {
      const chat = chatDetails[idx];
      if (chat) acc[id] = chat;
      return acc;
    }, {});
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 shrink-0 border-b">
        <h1 className="text-2xl font-semibold">Survey Results</h1>
        <Link href="/survey">
          <Button variant="ghost">← Back to survey</Button>
        </Link>
      </div>
      <p className="text-muted-foreground px-4 pb-2 shrink-0">
        View survey statistics and response distributions.
      </p>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {stats ? (
          <SurveyDashboard stats={stats} chatDetailsById={chatDetailsById} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No survey data available
          </div>
        )}
      </div>
    </div>
  );
}
