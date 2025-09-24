"use client";
import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";

type Props = {
  code: string;
  setCode: (v: string) => void;
  language?: "python" | "cpp" | "java" | "javascript" | "typescript";
  highlightLines?: number[]; // ← 추가
};

export default function CodeEditor({ code, setCode, language = "python", highlightLines = [] }: Props) {
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

    // 기존 데코 제거
    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
    if (!highlightLines.length) return;

    // 새 데코 추가
    const decos = highlightLines.map((ln) => ({
      range: new monaco.Range(ln, 1, ln, 1),
      options: {
        isWholeLine: true,
        className: "line-warn-bg",
        glyphMarginClassName: "glyph-warn",
        glyphMarginHoverMessage: { value: `Line ${ln}` }
      }
    }));
    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, decos);
  }, [highlightLines]);

  return (
    <div className="rounded-2xl border">
      <Editor
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