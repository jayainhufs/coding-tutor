import { NextResponse } from "next/server";
import { RefactorResponseSchema, type RefactorResponse } from "@/lib/refactor";
import { DEFAULT_STYLE, type StyleProfile } from "@/lib/style";

const MODEL = "gpt-4o-mini"; // ← 모델 고정

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { code = "", language = "python", style = DEFAULT_STYLE as StyleProfile } = body ?? {};

  const sys = `너는 코드 리팩토링 보조자다.
- 사용자의 스타일 프로파일을 최대한 반영한다(네이밍/들여쓰기/괄호/주석 톤 등).
- 결과는 반드시 JSON만 출력한다(RefactorResponse 스키마).`;
  const user = `언어: ${language}
스타일 프로파일(JSON):
${JSON.stringify(style, null, 2)}

원본 코드:
\`\`\`${language}
${code}
\`\`\`

스키마(JSON):
{
  "language": "python|cpp|java|js|ts",
  "rationale": "한 문단 설명",
  "changes": [
    { "type": "rename|extract-fn|reformat|comment|algo", "note": "...", "before": "...(optional)", "after": "...(optional)", "lines": [..](optional) }
  ],
  "refactoredCode": "리팩토링된 전체 코드 문자열"
}`;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
  }

  try {
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

    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("openai-not-json");
    }

    const safe = RefactorResponseSchema.safeParse(parsed);
    if (!safe.success) throw new Error("schema-validate-failed");

    return NextResponse.json(safe.data as RefactorResponse);
  } catch {
    // 폴백(스텁)
    const simple = code.replace(/\t/g, "    ").replace(/\"/g, "'");
    const fallback: RefactorResponse = {
      language,
      rationale: "탭→스페이스(4칸) 및 작은따옴표 일관화.",
      changes: [
        { type: "reformat", note: "탭을 4칸 스페이스로 변경" },
        { type: "reformat", note: "쌍따옴표→작은따옴표로 통일" },
      ],
      refactoredCode: simple,
    };
    return NextResponse.json(fallback);
  }
}