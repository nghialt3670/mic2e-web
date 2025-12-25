import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSurveyProgress, getSurveySampleCount, getTotalResponseCount } from "@/actions/survey-actions";
import { getSession } from "@/utils/server/auth-utils";

export default async function SurveyHomePage() {
  const progress = await getSurveyProgress();
  const sampleCount = await getSurveySampleCount();
  const responseCount = await getTotalResponseCount();
  const session = await getSession();
  const isAdmin = session?.user?.email === "22520946@gm.uit.edu.vn";
  return (
    <div className="max-w-6xl mx-auto w-full py-8 px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Survey</h1>
          <p className="text-muted-foreground">
            Configure survey samples and collect structured feedback.
          </p>
        </div>
        <Link href="/">
          <Button variant="ghost">← Back home</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Run survey</CardTitle>
            <CardDescription>
              Select a sample and submit answers for each chat and question.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="text-sm text-muted-foreground">
              Progress: <span className="font-semibold text-foreground">{progress}%</span> completed
            </div>
            <Link href="/survey/run" className="w-full">
              <Button className="w-full">
                Start survey
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Survey Results</CardTitle>
            <CardDescription>
              View and analyze survey responses and statistics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="text-sm text-muted-foreground">
              Responses: <span className="font-semibold text-foreground">{responseCount}</span>
            </div>
            <Link href="/survey/results" className="w-full">
              <Button className="w-full" variant="secondary">
                View dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Configure survey</CardTitle>
              <CardDescription>
                Define samples, chats, questions, and options before running surveys.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="text-sm text-muted-foreground">
                Samples: <span className="font-semibold text-foreground">{sampleCount}</span>
              </div>
              <Link href="/survey/config" className="w-full">
                <Button className="w-full" variant="outline">Go to config</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
