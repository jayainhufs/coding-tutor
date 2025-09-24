"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type { OnMount } from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";

/**
 * 핵심 아이디어
 * 1) vs 경로를 CDN으로 고정해서 로더가 앱 루트로 기웃거리지 않게 함
 * 2) loader.init() 직후 전역 define/require 를 원래 값으로 되돌려
 *    UMD 라이브러리(error-stack-parser 등)가 AMD 경로로 새로 로드되지 않게 함
 */

// 설치한 monaco-editor 버전과 맞추세요 (권장: 0.50.0)
const MONACO_VERSION = "0.50.0";
const VS_CDN = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`;

// 1) 경로 고정
loader.config({ paths: { vs: VS_CDN } });

// 2) 전역 AMD 심볼을 백업
const g = globalThis as any;
const prevDefine = g.define;
const prevRequire = g.require;

let monacoReady = false;
async function ensureMonacoLoaded() {
  if (monacoReady) return;
  try {
    await loader.init();
  } finally {
    // 3) 즉시 전역 AMD 심볼 복원 (중요!)
    if (prevDefine) g.define = prevDefine; else delete g.define;
    if (prevRequire) g.require = prevRequire; else delete g.require;
    monacoReady = true;
  }
}

// (선택) 워커 경로도 CDN으로 고정 – 네트워크 환경에 따라 안정성 ↑
(g as any).MonacoEnvironment = {
  getWorkerUrl() {
    // data URL로 워커 부트스트랩
    const src =
      `self.MonacoEnvironment={baseUrl:'${VS_CDN}/'};` +
      `importScripts('${VS_CDN}/base/worker/workerMain.js');`;
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(src)}`;
  },
};

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Props = {
  code: string;
  setCode: (v: string) => void;
  language?: "python" | "cpp" | "java" | "javascript" | "typescript";
  highlightLines?: number[];
};

export default function CodeEditor({
  code,
  setCode,
  language = "python",
  highlightLines = [],
}: Props) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationIdsRef = useRef<string[]>([]);

  // 에디터가 마운트되기 전에 로더 준비 + 전역 복원
  useEffect(() => {
    ensureMonacoLoaded().catch((e) =>
      console.warn("monaco ensure load failed:", e)
    );
  }, []);

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // 라인 하이라이트
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    decorationIdsRef.current = editor.deltaDecorations(
      decorationIdsRef.current,
      []
    );
    if (!highlightLines.length) return;

    const decos = highlightLines.map((ln) => ({
      range: new monaco.Range(ln, 1, ln, 1),
      options: {
        isWholeLine: true,
        className: "line-warn-bg",
        glyphMarginClassName: "glyph-warn",
        glyphMarginHoverMessage: { value: `Line ${ln}` },
      },
    }));
    decorationIdsRef.current = editor.deltaDecorations(
      decorationIdsRef.current,
      decos
    );
  }, [highlightLines]);

  return (
    <div className="rounded-2xl border">
      <Monaco
        height="420px"
        defaultLanguage={language}
        value={code}
        onChange={(v) => setCode(v || "")}
        onMount={onMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          glyphMargin: true,
        }}
      />
    </div>
  );
}