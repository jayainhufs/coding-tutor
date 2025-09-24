import { NextResponse } from "next/server";
// 아래 스키마는 앞서 만든 src/lib/schema.ts 기준입니다.
// 없다면 스키마 부분을 빼고 사용해도 되지만, 가능하면 넣어주세요.
import { FeedbackResponseSchema, type FeedbackResponse } from "@/lib/schema";

const MODEL = "gpt-4o-mini"; // ← 모델 고정

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { code = "", language = "python", problemId = "unknown" } = body ?? {};

  // 코드 줄 수를 함께 보내서 모델이 말도 안 되는 라인 번호를 내지 않도록 유도
  const totalLines = String(code).split("\n").length;

  const sys = `너는 초보자 맞춤 코딩 튜터다.
- 반드시 JSON만 출력한다.
- 제공된 코드 줄 수(${totalLines})를 넘는 라인 번호는 절대 쓰지 마라.
- 문법/들여쓰기 문제가 의심되면 라인 번호와 수정 제안을 구체적으로 적어라.
- cognition은 문제분해/패턴인식/추상화/알고리즘적사고 4개 섹션을 항상 채운다.`;

  const user = `문제ID: ${problemId}
언어: ${language}
학습자 코드:
\`\`\`${language}
${code}
\`\`\`

반환 스키마(JSON):
{
  "language": "python|cpp|java|js|ts",
  "overall": { "level": "beginner|intermediate|advanced", "keyMessage": "..." },
  "inlineIssues": [
    { "message": "...", "severity": "info|warn|error", "lines": [3,10], "suggestion": "..." }
  ],
  "cognition": {
    "decomposition": { "title": "...", "summary": "...", "checklist": ["..."], "examples": ["..."] },
    "pattern": { "title": "...", "summary": "...", "checklist": ["..."], "examples": ["..."] },
    "abstraction": { "title": "...", "summary": "...", "checklist": ["..."], "examples": ["..."] },
    "algorithm": { "title": "...", "summary": "...", "checklist": ["..."], "examples": ["..."] }
  },
  "problemId": "${problemId}"
}`;

  // 안전장치: 키 없으면 500
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
  }

  try {
    // OpenAI REST 호출 (SDK 없이)
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
    });

    const raw = await resp.json();
    const text = raw?.choices?.[0]?.message?.content ?? "{}";

    // JSON 파싱 + 검증
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("openai-not-json");
    }

    const safe = FeedbackResponseSchema.safeParse(parsed);
    if (!safe.success) throw new Error("schema-validate-failed");

    return NextResponse.json(safe.data as FeedbackResponse);
  } catch (e) {
    // 폴백(스텁)
    const fallback: FeedbackResponse = {
      problemId,
      language: language as any,
      overall: { level: "beginner", keyMessage: "불필요한 중첩 루프 대신 해시맵을 활용해보세요." },
      inlineIssues: [
        { message: "중첩 루프는 O(n^2)입니다.", severity: "warn", lines: [3, 10], suggestion: "보완값 딕셔너리 사용" },
      ],
      cognition: {
        decomposition: {
          title: "문제 분해",
          summary: "입력 순회 → 보완값 확인 → 정답 반환 세 단계.",
          checklist: ["보완값 계산", "맵 조회", "정답 즉시 반환"],
          examples: ["comp = target - nums[i]"],
        },
        pattern: {
          title: "패턴 인식",
          summary: "해시맵 패턴 일반화.",
          checklist: ["한 번 순회", "O(1) 조회"],
          examples: ["값→인덱스 매핑"],
        },
        abstraction: {
          title: "추상화",
          summary: "핵심은 보완값 존재 확인.",
          checklist: ["자료구조: Map/Dict", "키: 값", "값: 인덱스"],
        },
        algorithm: {
          title: "알고리즘적 사고",
          summary: "O(n)으로 설계.",
          checklist: ["단일 루프", "조기 반환"],
          examples: ["if (map.has(comp)) return ..."],
        },
      },
    };
    return NextResponse.json(fallback, { status: 200 });
  }
}