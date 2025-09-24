"use client";
import { useEffect, useRef, useState } from "react";

declare global { interface Window { loadPyodide?: any } }

/** 신뢰도 높은 후보들을 여러 개 둡니다 */
const CANDIDATES = [
  // 최신 계열
  { js: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js",  index: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/" },
  { js: "https://cdn.jsdelivr.net/npm/pyodide@0.26.1/full/pyodide.js", index: "https://cdn.jsdelivr.net/npm/pyodide@0.26.1/full/" },
  // 한 버전 낮게
  { js: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js",  index: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/" },
  { js: "https://cdn.jsdelivr.net/npm/pyodide@0.25.1/full/pyodide.js", index: "https://cdn.jsdelivr.net/npm/pyodide@0.25.1/full/" },
];

function looksLikeHtml(s: string) {
  const head = s.slice(0, 200).toLowerCase();
  return head.includes("<!doctype") || head.includes("<html");
}

async function fetchAsText(url: string) {
  const r = await fetch(url, { mode: "cors" });
  if (!r.ok) throw new Error(`HTTP ${r.status} @ ${url}`);
  const text = await r.text();
  if (looksLikeHtml(text)) throw new Error(`Got HTML instead of JS @ ${url}`);
  return text;
}

function injectScriptFromString(code: string) {
  return new Promise<void>((resolve, reject) => {
    const blob = new Blob([code], { type: "text/javascript" });
    const src = URL.createObjectURL(blob);
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => { URL.revokeObjectURL(src); resolve(); };
    s.onerror = () => { URL.revokeObjectURL(src); reject(new Error("script inject failed")); };
    document.head.appendChild(s);
  });
}

export type PySyntaxIssue = { line: number; message: string; suggestion?: string };

export function usePyodide() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pyRef = useRef<any>(null);
  const indexUrlRef = useRef<string | null>(null);

  // 스크립트 로드 + pyodide 초기화
  useEffect(() => {
    (async () => {
      try {
        if (typeof window === "undefined" || pyRef.current) return;

        if (!window.loadPyodide) {
          let lastErr: any = null;
          for (const c of CANDIDATES) {
            try {
              const js = await fetchAsText(c.js);      // 1) 받아본 뒤
              await injectScriptFromString(js);        // 2) 로컬로 주입(크로스오리진 문제 회피)
              indexUrlRef.current = c.index;           // 3) 같은 base로 리소스 받기
              lastErr = null;
              break;
            } catch (e) {
              lastErr = e;
            }
          }
          if (lastErr) throw lastErr;
        }

        const indexURL = indexUrlRef.current ?? CANDIDATES[0].index;
        const py = await window.loadPyodide!({ indexURL });
        pyRef.current = py;
        setReady(true);
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    })();
  }, []);

  /** 문법/들여쓰기 빠른 분석 (AI 호출 전에) */
  async function analyzeSyntax(code: string): Promise<PySyntaxIssue[]> {
    const py = pyRef.current;
    if (!py) return [];
    py.globals.set("USER_CODE", code);
    await py.runPythonAsync(`
import ast
def _analyze(code):
    try:
        ast.parse(code)
        return {"ok": True, "errors": []}
    except SyntaxError as e:
        msg = str(e.msg or "SyntaxError")
        if msg in ("return' outside function", "return outside function"):
            msg = "return outside function"
        return {"ok": False, "errors": [{"line": int(getattr(e, "lineno", 1) or 1), "message": msg}]}
RES = _analyze(USER_CODE)
    `);
    const res = py.globals.get("RES");
    const obj = res.toJs();
    return (obj.errors || []).map((it: any) => {
      const m: string = it.message || "Syntax error";
      let suggestion: string | undefined;
      if (/return outside function/.test(m)) suggestion = "함수 내부에 return이 오도록 들여쓰기 하세요.";
      if (/unexpected indent/i.test(m))    suggestion = "들여쓰기 깊이를 맞추세요.";
      if (/expected ':'/.test(m))          suggestion = "끝에 ':'을 추가하세요.";
      if (/unterminated/i.test(m))         suggestion = "괄호/문자열이 닫혔는지 확인하세요.";
      return { line: Number(it.line || 1), message: m, suggestion };
    });
  }

  /** 사용자가 작성한 함수 호출 */
  async function call(code: string, fnName: string, args: any[]) {
    const py = pyRef.current;
    if (!py) throw new Error("Pyodide not ready");
    try {
      await py.runPythonAsync(code);
      const fn = py.globals.get(fnName);
      const res = fn(...args);
      // @ts-ignore
      return typeof res?.toJs === "function" ? res.toJs({ dict_converter: Object.fromEntries }) : res;
    } catch (e: any) {
      throw new Error("Python runtime error: " + (e?.message || String(e)));
    }
  }

  return { ready, error, analyzeSyntax, call };
}