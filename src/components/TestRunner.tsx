"use client";
import { useState } from "react";
import { usePyodide } from "@/hooks/usePyodide";
import type { Problem } from "@/data/problems";
import { Button } from "@/components/ui/button";

export default function TestRunner({ code, problem }: { code: string; problem: Problem }) {
  const { ready, call, error } = usePyodide();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ pass: boolean; got: any; exp: any; idx: number; explain?: string }[]>([]);
  const [runError, setRunError] = useState<string | null>(null);

  const run = async () => {
    if (!ready) return;
    setRunning(true); setRunError(null);
    const r: typeof results = [];
    try {
      for (let i = 0; i < problem.tests.length; i++) {
        const t = problem.tests[i];
        const got = await call(code, problem.entryFn, t.input);
        const pass = JSON.stringify(got) === JSON.stringify(t.output);
        r.push({ pass, got, exp: t.output, idx: i + 1, explain: t.explanation });
      }
      setResults(r);
    } catch (e: any) {
      setRunError(e?.message || String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && <div className="text-sm text-red-600 border border-red-300 rounded p-2">Pyodide 로딩 실패: {error}</div>}
      {runError && <div className="text-sm text-red-600 border border-red-300 rounded p-2">런타임 오류: {runError}</div>}

      <Button onClick={run} disabled={running || !ready}>
        {!ready ? "파이썬 로딩 중..." : (running ? "테스트 실행 중..." : "테스트 실행")}
      </Button>

      <div className="space-y-2">
        {results.map((res, i) => (
          <div key={i} className={`rounded border p-2 text-sm ${res.pass ? "bg-green-50" : "bg-red-50"}`}>
            <div className="font-medium">#{res.idx} {res.pass ? "✅ Passed" : "❌ Failed"}</div>
            {!res.pass && (
              <div className="text-xs">
                <div>기대값: {JSON.stringify(res.exp)}</div>
                <div>실제값: {JSON.stringify(res.got)}</div>
              </div>
            )}
            {res.explain && <div className="text-xs text-muted-foreground mt-1">{res.explain}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}