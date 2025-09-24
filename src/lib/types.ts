export type ThinkingCategory = "decomposition" | "pattern" | "abstraction" | "algorithm";

export interface InlineIssue {
  message: string;
  severity: "info" | "warn" | "error";
  lines?: number[];
  suggestion?: string;
}

export interface CategoryFeedback {
  title: string;
  summary: string;
  checklist: string[];
  examples?: string[];
}

export interface FeedbackResponse {
  problemId?: string;
  language: "python" | "cpp" | "java" | "js" | "ts";
  overall: {
    level: "beginner" | "intermediate" | "advanced";
    keyMessage: string;
  };
  inlineIssues: InlineIssue[];
  cognition: Record<ThinkingCategory, CategoryFeedback>;
}