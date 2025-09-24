"use client";
import { DiffEditor } from "@monaco-editor/react";

export default function DiffViewer({ original, modified, language="python" }:{
  original: string; modified: string; language?: "python"|"cpp"|"java"|"javascript"|"typescript";
}) {
  return (
    <div className="rounded-2xl border">
      <DiffEditor
        height="420px"
        original={original}
        modified={modified}
        language={language}
        options={{ renderSideBySide: true, readOnly: true, minimap: { enabled: false } }}
      />
    </div>
  );
}