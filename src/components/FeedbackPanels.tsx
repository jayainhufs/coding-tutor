"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FeedbackResponse } from "@/lib/types";

export default function FeedbackPanels({ data }: { data: FeedbackResponse | null }) {
  if (!data) return null;
  const { overall, inlineIssues, cognition } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>총평</CardTitle>
          <Badge variant="secondary">{overall.level}</Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-3">{overall.keyMessage}</p>
          <div className="space-y-2">
            {inlineIssues.map((it, idx) => (
              <div key={idx} className="text-sm p-2 rounded border">
                <div className="flex items-center gap-2">
                  <Badge>{it.severity}</Badge>
                  {it.lines && <span className="text-muted-foreground">lines: {it.lines.join(", ")}</span>}
                </div>
                <div className="mt-1">{it.message}</div>
                {it.suggestion && <div className="text-muted-foreground mt-1">💡 {it.suggestion}</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {(["decomposition","pattern","abstraction","algorithm"] as const).map((k) => {
        const c = cognition[k];
        return (
          <Card key={k}>
            <CardHeader><CardTitle>{c.title}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{c.summary}</p>
              <ul className="list-disc pl-5 text-sm">
                {c.checklist.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              {c.examples && c.examples.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground">예시</div>
                  <ul className="list-disc pl-5 text-sm">
                    {c.examples.map((e, i) => <li key={i}><code>{e}</code></li>)}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}