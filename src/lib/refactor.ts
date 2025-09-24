import { z } from "zod";

export const RefactorResponseSchema = z.object({
  language: z.enum(["python", "cpp", "java", "js", "ts"]),
  rationale: z.string(), // 왜 이렇게 바꿨는지 한 문단
  changes: z.array(z.object({
    type: z.enum(["rename", "extract-fn", "reformat", "comment", "algo"]),
    before: z.string().optional(),
    after: z.string().optional(),
    lines: z.array(z.number()).optional(),
    note: z.string()
  })),
  refactoredCode: z.string() // 최종 코드
});

export type RefactorResponse = z.infer<typeof RefactorResponseSchema>;