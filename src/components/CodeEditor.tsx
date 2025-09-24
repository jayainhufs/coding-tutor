"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
// 타입은 type-only import로 유지 (번들 영향 없음)
import type { OnMount } from "@monaco-editor/react";

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

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
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
    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, decos);
  }, [highlightLines]);

  return (
    <div className="rounded-2xl border">
      <Monaco
        height="420px"
        defaultLanguage={language}
        value={code}
        onChange={(v) => setCode(v || "")}
        onMount={onMount}
        options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, glyphMargin: true }}
      />
    </div>
  );
}