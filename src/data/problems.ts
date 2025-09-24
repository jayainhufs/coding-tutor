export type Difficulty = "Easy" | "Medium" | "Hard";
export type TestCase = { input: any[]; output: any; explanation?: string };

export type Problem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  entryFn: string;         // 파이썬에서 호출할 함수명
  description: string;
  starterCode: string;
  tests: TestCase[];
  hints: string[];
};

export const problems: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "HashMap"],
    entryFn: "two_sum",
    description:
      "정수 배열 nums와 정수 target이 주어질 때, 합이 target이 되는 서로 다른 두 인덱스를 반환하세요.",
    starterCode: `def two_sum(nums, target):
    # TODO: 여기에 코드를 작성하세요
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return [-1, -1]
`,
    tests: [
      { input: [[2,7,11,15], 9], output: [0,1] },
      { input: [[3,2,4], 6], output: [1,2] },
      { input: [[3,3], 6], output: [0,1] }
    ],
    hints: [
      "보완값(target - x)과 인덱스를 딕셔너리에 저장해보세요.",
      "한 번만 순회하면서 보완값이 이미 나왔는지 확인할 수 있어요."
    ]
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    entryFn: "is_valid",
    description:
      "괄호 문자열 s가 주어질 때, 적절히 열리고 닫히는지 여부를 반환하세요.",
    starterCode: `def is_valid(s: str) -> bool:
    # TODO: 스택을 사용해보세요
    return True
`,
    tests: [
      { input: ["()"], output: true },
      { input: ["()[]{}"], output: true },
      { input: ["(]"], output: false },
      { input: ["([)]"], output: false },
      { input: ["{[]}"], output: true }
    ],
    hints: [
      "여는 괄호를 스택에 푸시하고, 닫는 괄호를 만나면 매칭되는지 확인하세요.",
      "괄호 쌍 매핑 딕셔너리를 만들어두면 편합니다."
    ]
  },
  {
    id: "fibonacci",
    title: "Fibonacci Number",
    difficulty: "Easy",
    tags: ["DP"],
    entryFn: "fib",
    description:
      "정수 n이 주어질 때, 피보나치 수 F(n)을 반환하세요. (F(0)=0, F(1)=1)",
    starterCode: `def fib(n: int) -> int:
    # TODO: 반복문 또는 메모이제이션
    return 0
`,
    tests: [
      { input: [0], output: 0 },
      { input: [1], output: 1 },
      { input: [10], output: 55 }
    ],
    hints: [
      "반복문으로 O(n) 시간에 해결할 수 있습니다.",
      "공간을 O(1)로 줄일 수도 있어요."
    ]
  }
];

export function getProblem(id: string) {
  return problems.find((p) => p.id === id);
}