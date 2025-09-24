"use client";

import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import FeedbackPanels from "@/components/FeedbackPanels";
import DiffViewer from "@/components/DiffViewer";
import type { FeedbackResponse } from "@/lib/types";
import type { RefactorResponse } from "@/lib/refactor";
import { DEFAULT_STYLE } from "@/lib/style";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const INITIAL_CODE = `# two-sum naive
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return [-1, -1]
`;

export default function SolvePage() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [data, setData] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [refactor, setRefactor] = useState<RefactorResponse | null>(null);
  const [refLoading, setRefLoading] = useState(false);

  // inlineIssues의 라인들을 에디터 하이라이트로 표시
  const highlightLines = useMemo(() => {
    if (!data) return [];
    const lines = (data.inlineIssues ?? []).flatMap((it) => it.lines ?? []);
    return Array.from(new Set(lines)).sort((a, b) => a - b);
  }, [data]);

  const onFeedback = async () => {
    setLoading(true);
    setRefactor(null); // 새 피드백 시 이전 리팩터링 결과 초기화
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python", problemId: "two-sum" })
      });
      const json: FeedbackResponse = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  const onRefactor = async () => {
    setRefLoading(true);
    try {
      const res = await fetch("/api/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python", style: DEFAULT_STYLE })
      });
      const json: RefactorResponse = await res.json();
      setRefactor(json);
    } finally {
      setRefLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Two Sum (예시)</h1>

      {/* Code Editor with line highlights */}
      <CodeEditor code={code} setCode={setCode} language="python" highlightLines={highlightLines} />

      <div className="flex gap-3">
        <Button onClick={onFeedback} disabled={loading}>
          {loading ? "분석 중..." : "피드백 받기"}
        </Button>
        <Button variant="secondary" onClick={() => { setCode(INITIAL_CODE); setData(null); setRefactor(null); }}>
          초기 코드로
        </Button>
        <Button onClick={onRefactor} disabled={refLoading}>
          {refLoading ? "리팩터링 중..." : "스타일 리팩터링(AI)"}
        </Button>
      </div>

      <Separator />

      {/* 피드백 패널 */}
      <FeedbackPanels data={data} />

      {/* 리팩터링 결과 Diff */}
      {refactor && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">리팩터링 결과</h2>
          <p className="text-sm text-muted-foreground">{refactor.rationale}</p>
          <DiffViewer original={code} modified={refactor.refactoredCode} language="python" />
        </div>
      )}
    </main>
  );
}