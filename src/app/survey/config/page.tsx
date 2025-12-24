import Link from "next/link";

import { listSurveySamples, getSurveyTemplates, listUserChats } from "@/actions/survey-actions";
import { Button } from "@/components/ui/button";
import { SurveyConfigClient } from "@/components/survey/survey-config-client";

export default async function SurveyConfigPage() {
  const samples = await listSurveySamples();
  const templates = await getSurveyTemplates();
  const chats = await listUserChats();

  return (
    <div className="max-w-5xl mx-auto w-full py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Configure survey</h1>
          <p className="text-muted-foreground">Define samples, chats, and questions.</p>
        </div>
        <Link href="/survey">
          <Button variant="ghost">← Back to survey</Button>
        </Link>
      </div>

      <SurveyConfigClient
        initialSamples={samples as any}
        templates={templates}
        availableChats={chats}
      />
    </div>
  );
}
