"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    loadPyodide?: any;
  }
}

/** 신뢰도 높은 CDN 후보들 */
const CANDIDATES = [
  // 최신 계열
  { js: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js", index: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/" },
  { js: "https://cdn.jsdelivr.net/npm/pyodide@0.26.1/full/pyodide.js", index: "https://cdn.jsdelivr.net/npm/pyodide@0.26.1/full/" },
  // 한 버전 낮게
  { js: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js", index: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/" },
  { js: "https://cdn.jsdelivr.net/npm/pyodide@0.25.1/full/pyodide.js", index: "https://cdn.jsdelivr.net/npm/pyodide@0.25.1/full/" },
];

function looksLikeHtml(s: string) {
  const head = s.slice(0, 200).toLowerCase();
  return head.includes("<!doctype") || head.includes("<html");
}

/** url이 JS인지 사전 검증 후 <script src=…>로 안전하게 로드 */
async function loadScriptValidated(url: string) {
  // 1) 받아서 HTML 에러페이지 여부 확인
  const r = await fetch(url, { mode: "cors", cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status} @ ${url}`);
  const sniff = await r.text();
  if (looksLikeHtml(sniff)) throw new Error(`Got HTML instead of JS @ ${url}`);

  // 2) 실제로 <script src="..."> 로드 (Blob 주입 X → *.map 이슈 원천 차단)
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.referrerPolicy = "no-referrer";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`script load failed @ ${url}`));
    document.head.appendChild(s);
  });
}

export type PySyntaxIssue = { line: number; message: string; suggestion?: string };

export function usePyodide() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pyRef = useRef<any>(null);
  const indexUrlRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (typeof window === "undefined" || pyRef.current) return;

        if (!window.loadPyodide) {
          let lastErr: any = null;
          for (const c of CANDIDATES) {
            try {
              await loadScriptValidated(c.js);
              indexUrlRef.current = c.index;
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