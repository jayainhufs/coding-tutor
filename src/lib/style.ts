export type Lang = "python" | "cpp" | "java" | "js" | "ts";

export interface StyleProfile {
  language: Lang;
  naming: "snake_case" | "camelCase" | "PascalCase";
  indent: 2 | 4;
  quotes?: "single" | "double";
  maxLineLen?: number;
  braceStyle?: "same-line" | "next-line";   // (C/JS 계열용)
  commentTone?: "concise" | "explanatory";  // 주석 톤
  importOrder?: "stdlib-first" | "alpha";
  preferImmutable?: boolean;                // const/val, 튜플 선호 등
  docstring?: "google" | "numpy" | "none";  // 파이썬
  userTokens?: string[];                    // 네가 자주 쓰는 변수/네이밍 키워드
}

export const DEFAULT_STYLE: StyleProfile = {
  language: "python",
  naming: "snake_case",
  indent: 4,
  quotes: "single",
  maxLineLen: 100,
  commentTone: "concise",
  importOrder: "stdlib-first",
  preferImmutable: false,
  docstring: "google",
  userTokens: []
};