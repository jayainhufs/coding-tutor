"use client";
import { useEffect, useRef, useState } from "react";

declare global { interface Window { loadPyodide?: any } }

const URLS = [
  "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js",
  "https://cdn.jsdelivr.net/npm/pyodide@0.25.1/full/pyodide.js"
];

function loadScriptOnce(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`pyodide load failed: ${src}`));
    document.body.appendChild(s);
  });
}

export type PySyntaxIssue = { line: number; message: string; suggestion?: string };

export function usePyodide() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pyRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        if (typeof window === "undefined" || pyRef.current) return;
        if (!window.loadPyodide) {
          let last: any = null;
          for (const u of URLS) {
            try { await loadScriptOnce(u); last = null; break; }
            catch (e) { last = e; }
          }
          if (last) throw last;
        }
        const py = await window.loadPyodide!({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/" });
        pyRef.current = py;
        setReady(true);
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    })();
  }, []);

  /** 문법/들여쓰기 빠르게 체크 (AI 호출 전) */
  async function analyzeSyntax(code: string): Promise<PySyntaxIssue[]> {
    const py = pyRef.current;
    if (!py) return [];
    // 코드 전달
    py.globals.set("USER_CODE", code);
    await py.runPythonAsync(`
import ast, json
def _analyze(code):
    try:
        ast.parse(code)
        return {"ok": True, "errors": []}
    except SyntaxError as e:
        # 대표 메시지 보정
        msg = str(e.msg or "SyntaxError")
        if msg == "return' outside function" or msg == "return outside function":
            msg = "return outside function"
        return {"ok": False, "errors": [{"line": int(getattr(e, "lineno", 1) or 1), "message": msg}]}
RES = _analyze(USER_CODE)
    `);
    const res = py.globals.get("RES");
    const obj = res.toJs();
    const issues: PySyntaxIssue[] = (obj.errors || []).map((it: any) => {
      const m: string = it.message || "Syntax error";
      let suggestion: string | undefined;
      if (/return outside function/.test(m)) suggestion = "함수 내부에 return이 오도록 들여쓰기 하세요.";
      if (/unexpected indent/i.test(m))    suggestion = "들여쓰기 깊이를 맞추세요.";
      if (/expected ':'/.test(m))          suggestion = "끝에 ':'을 추가하세요.";
      if (/unterminated/i.test(m))         suggestion = "괄호/문자열이 닫혔는지 확인하세요.";
      return { line: Number(it.line || 1), message: m, suggestion };
    });
    return issues;
  }

  /** 임의 파이썬 함수 호출 (테스트용) */
  async function call(code: string, fnName: string, args: any[]) {
    const py = pyRef.current;
    if (!py) throw new Error("Pyodide not ready");
    await py.runPythonAsync(code);
    const fn = py.globals.get(fnName);
    const res = fn(...args);
    // @ts-ignore
    return typeof res?.toJs === "function" ? res.toJs({ dict_converter: Object.fromEntries }) : res;
  }

  return { ready, error, analyzeSyntax, call };
}