// src/app/problems/[id]/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProblem } from "@/data/problems";
import CodeEditor from "@/components/CodeEditor";
import FeedbackPanels from "@/components/FeedbackPanels";
import TestRunner from "@/components/TestRunner";
import DiffViewer from "@/components/DiffViewer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { FeedbackResponse } from "@/lib/types";
import type { RefactorResponse } from "@/lib/refactor";
import { DEFAULT_STYLE } from "@/lib/style";
import { usePyodide } from "@/hooks/usePyodide";

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const problem = getProblem(id);

  const [code, setCode] = useState(problem?.starterCode ?? "");
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [refactor, setRefactor] = useState<RefactorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refLoading, setRefLoading] = useState(false);

  // Pyodide: 문법/들여쓰기 프리체크에 사용
  const { ready: pyReady, analyzeSyntax } = usePyodide();

  // 하이라이트 라인: 실제 줄 수를 벗어나지 않도록 클램핑
  const hiLines = useMemo(() => {
    if (!feedback) return [];
    const total = code.split("\n").length;
    const raw = (feedback.inlineIssues ?? []).flatMap((i) => i.lines ?? []);
    return Array.from(
      new Set(raw.map((n) => Math.min(Math.max(1, Number(n) || 1), total)))
    ).sort((a, b) => a - b);
  }, [feedback, code]);

  if (!problem) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p>존재하지 않는 문제입니다.</p>
        <Button onClick={() => router.push("/problems")} className="mt-3">
          목록으로
        </Button>
      </main>
    );
  }

  // AI 힌트/피드백: 먼저 문법/들여쓰기 프리체크 → 이상 없을 때만 AI 호출
  const getFeedback = async () => {
    setLoading(true);
    setRefactor(null);

    try {
      // 1) 문법/들여쓰기 프리체크 (가능할 때만)
      if (pyReady) {
        const issues = await analyzeSyntax(code);
        if (issues.length) {
          // 문법 오류가 있으면 AI 호출을 생략하고 즉시 라인 단위 에러를 반환
          const obj: FeedbackResponse = {
            problemId: problem.id,
            language: "python",
            overall: {
              level: "beginner",
              keyMessage: "문법/들여쓰기 오류를 먼저 해결하세요.",
            },
            inlineIssues: issues.map((it) => ({
              message: it.message,
              severity: "error",
              lines: [it.line],
              suggestion: it.suggestion,
            })),
            cognition: {
              decomposition: {
                title: "문제 분해",
                summary: "문법 오류 해결 → 테스트 통과 → 성능 개선 순서로 진행하세요.",
                checklist: ["문법 오류 해결", "테스트 통과", "성능 개선"],
              },
              pattern: {
                title: "패턴 인식",
                summary: "파이썬은 들여쓰기로 블록을 구분합니다.",
                checklist: ["블록 들여쓰기", "콜론(:) 위치 점검"],
              },
              abstraction: {
                title: "추상화",
                summary: "핵심은 함수 내부 로직의 완결성입니다.",
                checklist: ["반환 위치", "스코프 범위"],
              },
              algorithm: {
                title: "알고리즘적 사고",
                summary:
                  "문법이 맞아야 알고리즘 분석과 개선이 가능합니다.",
                checklist: ["컴파일 성공", "간단 케이스 테스트"],
              },
            },
          };
          setFeedback(obj);
          return;
        }
      }

      // 2) 문법 OK → AI 호출
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: "python",
          problemId: problem.id,
        }),
      });
      const json: FeedbackResponse = await res.json();
      setFeedback(json);
    } finally {
      setLoading(false);
    }
  };

  const doRefactor = async () => {
    setRefLoading(true);
    try {
      const res = await fetch("/api/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python", style: DEFAULT_STYLE }),
      });
      const json: RefactorResponse = await res.json();
      setRefactor(json);
    } finally {
      setRefLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{problem.title}</h1>
          <div className="text-sm text-muted-foreground">
            {problem.tags.join(" · ")}
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded border">
          {problem.difficulty}
        </span>
      </div>

      <p className="text-sm whitespace-pre-wrap">{problem.description}</p>

      <CodeEditor
        code={code}
        setCode={setCode}
        language="python"
        highlightLines={hiLines}
      />

      <div className="flex gap-2 flex-wrap">
        <Button onClick={getFeedback} disabled={loading}>
          {loading ? "분석 중..." : "AI 힌트/피드백"}
        </Button>
        <Button onClick={doRefactor} disabled={refLoading}>
          {refLoading ? "리팩터링 중..." : "스타일 리팩터링"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setCode(problem.starterCode);
            setFeedback(null);
            setRefactor(null);
          }}
        >
          초기 코드로
        </Button>
      </div>

      <Separator />

      {/* 내장 힌트(수동) */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">힌트</h2>
        <ul className="list-disc pl-5 text-sm">
          {problem.hints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>

      {/* 테스트 러너 */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">테스트</h2>
        <TestRunner code={code} problem={problem} />
      </div>

      {/* AI 피드백 */}
      <FeedbackPanels data={feedback} />

      {/* 리팩터 결과 */}
      {refactor && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">리팩터링 결과</h2>
          <p className="text-sm text-muted-foreground">{refactor.rationale}</p>
          <DiffViewer
            original={code}
            modified={refactor.refactoredCode}
            language="python"
          />
        </div>
      )}
    </main>
  );
}