import { z } from "zod";

export const InlineIssueSchema = z.object({
  message: z.string(),
  severity: z.enum(["info","warn","error"]),
  lines: z.array(z.number()).optional(),
  suggestion: z.string().optional()
});

export const CategoryFeedbackSchema = z.object({
  title: z.string(),
  summary: z.string(),
  checklist: z.array(z.string()),
  examples: z.array(z.string()).optional()
});

export const FeedbackResponseSchema = z.object({
  problemId: z.string().optional(),
  language: z.enum(["python","cpp","java","js","ts"]),
  overall: z.object({
    level: z.enum(["beginner","intermediate","advanced"]),
    keyMessage: z.string()
  }),
  inlineIssues: z.array(InlineIssueSchema),
  cognition: z.object({
    decomposition: CategoryFeedbackSchema,
    pattern: CategoryFeedbackSchema,
    abstraction: CategoryFeedbackSchema,
    algorithm: CategoryFeedbackSchema
  })
});

export type FeedbackResponse = z.infer<typeof FeedbackResponseSchema>;