import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSurveyStats } from "@/actions/survey-actions";
import { SurveyDashboard } from "@/components/survey/survey-dashboard";

export default async function SurveyResultsPage() {
  const stats = await getSurveyStats();

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
          <SurveyDashboard stats={stats} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No survey data available
          </div>
        )}
      </div>
    </div>
  );
}
