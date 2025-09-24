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
  // ---- 기존 3개 (유지) ----
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "HashMap"],
    entryFn: "two_sum",
    description:
      "정수 배열 nums와 정수 target이 주어질 때, 합이 target이 되는 서로 다른 두 인덱스를 반환하세요.",
    starterCode: `def two_sum(nums, target):
    # TODO: 해시맵(보완값)으로 O(n)에 해결해보세요.
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
    # TODO: 스택을 사용해 여는 괄호를 push, 닫는 괄호에서 pop/검사
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
    # TODO: 반복문 또는 메모이제이션으로 O(n)에 계산
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
  },

  // ---- 새로 추가 11개+ ----

  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Array", "BinarySearch"],
    entryFn: "binary_search",
    description:
      "오름차순 정렬된 nums에서 target의 인덱스를 반환하세요. 없으면 -1.",
    starterCode: `def binary_search(nums, target):
    # TODO: 좌/우 포인터로 이분 탐색
    left, right = 0, len(nums) - 1
    return -1
`,
    tests: [
      { input: [[-1,0,3,5,9,12], 9], output: 4 },
      { input: [[-1,0,3,5,9,12], 2], output: -1 },
      { input: [[], 1], output: -1 }
    ],
    hints: [
      "mid = (left+right)//2",
      "nums[mid]와 target 비교 후 범위를 반으로 줄이세요."
    ]
  },

  {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["DP", "Kadane"],
    entryFn: "max_sub_array",
    description:
      "정수 배열에서 연속 부분 배열의 합이 최대가 되는 값을 반환하세요.",
    starterCode: `def max_sub_array(nums):
    # TODO: Kadane 알고리즘
    return 0
`,
    tests: [
      { input: [[-2,1,-3,4,-1,2,1,-5,4]], output: 6 },
      { input: [[1]], output: 1 },
      { input: [[5,4,-1,7,8]], output: 23 }
    ],
    hints: [
      "현재 연속합 vs 현재 원소 중 큰 값을 선택하며 진행",
      "전역 최댓값을 갱신"
    ]
  },

  {
    id: "move-zeroes",
    title: "Move Zeroes",
    difficulty: "Easy",
    tags: ["Array", "TwoPointers"],
    entryFn: "move_zeroes",
    description:
      "배열의 0을 오른쪽 끝으로 이동시키고, 나머지 원소의 상대적 순서를 유지하세요. 새 배열을 반환하세요.",
    starterCode: `def move_zeroes(nums):
    # TODO: 두 포인터로 0이 아닌 원소를 앞쪽에 모으고 결과 반환
    return nums
`,
    tests: [
      { input: [[0,1,0,3,12]], output: [1,3,12,0,0] },
      { input: [[0]], output: [0] },
      { input: [[2,1]], output: [2,1] }
    ],
    hints: [
      "write 포인터를 따로 두고, 0이 아닌 값만 앞으로 복사",
      "마지막에 남은 자리는 0으로 채우기"
    ]
  },

  {
    id: "product-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    tags: ["Array", "PrefixSuffix"],
    entryFn: "product_except_self",
    description:
      "자기 자신을 제외한 나머지 원소들의 곱을 각 위치에 담은 배열을 반환하세요. 나눗셈 금지.",
    starterCode: `def product_except_self(nums):
    # TODO: 왼쪽 곱/오른쪽 곱을 미리 계산
    return [1]*len(nums)
`,
    tests: [
      { input: [[1,2,3,4]], output: [24,12,8,6] },
      { input: [[-1,1,0,-3,3]], output: [0,0,9,0,0] }
    ],
    hints: [
      "prefix[i] * suffix[i] = 정답[i]",
      "공간 최적화를 고려해도 좋습니다."
    ]
  },

  {
    id: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    tags: ["HashMap", "String"],
    entryFn: "is_anagram",
    description:
      "문자열 s와 t가 주어질 때, 서로 애너그램인지 판단하세요.",
    starterCode: `def is_anagram(s: str, t: str) -> bool:
    # TODO: 문자 빈도 비교
    return False
`,
    tests: [
      { input: ["anagram", "nagaram"], output: true },
      { input: ["rat", "car"], output: false }
    ],
    hints: [
      "길이가 다르면 false",
      "딕셔너리(카운터)로 각 문자의 빈도를 비교"
    ]
  },

  {
    id: "longest-palindrome",
    title: "Longest Palindrome (by count)",
    difficulty: "Easy",
    tags: ["Greedy", "HashMap"],
    entryFn: "longest_palindrome_len",
    description:
      "문자열 s로 만들 수 있는 가장 긴 팰린드롬의 길이를 반환하세요.",
    starterCode: `def longest_palindrome_len(s: str) -> int:
    # TODO: 짝수 개수는 전부 사용, 홀수 개수는 하나만 중앙에
    return 0
`,
    tests: [
      { input: ["abccccdd"], output: 7 },
      { input: ["a"], output: 1 },
      { input: ["aaabbb"], output: 5 }
    ],
    hints: [
      "각 문자의 빈도를 세고, 짝수는 더하고, 홀수는 (개수-1)을 더한 뒤 중앙에 하나 가능"
    ]
  },

  {
    id: "two-sum-ii",
    title: "Two Sum II (Input sorted)",
    difficulty: "Easy",
    tags: ["TwoPointers", "Array"],
    entryFn: "two_sum_sorted",
    description:
      "정렬된 배열에서 target 합이 되는 1-based 두 인덱스를 반환하세요.",
    starterCode: `def two_sum_sorted(numbers, target):
    # TODO: 양 끝 포인터로 합 비교
    return [1, 1]
`,
    tests: [
      { input: [[2,7,11,15], 9], output: [1,2] },
      { input: [[2,3,4], 6], output: [1,3] },
      { input: [[-1,0], -1], output: [1,2] }
    ],
    hints: [
      "left/right 포인터 이동 규칙을 세우세요.",
      "현재 합<target이면 left++, 크면 right--"
    ]
  },

  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["DP"],
    entryFn: "climb_stairs",
    description:
      "한 번에 1칸 또는 2칸 오를 수 있을 때, n번째 계단까지 오르는 방법의 수를 반환하세요.",
    starterCode: `def climb_stairs(n: int) -> int:
    # TODO: 피보나치와 동일한 점화식
    return 0
`,
    tests: [
      { input: [2], output: 2 },
      { input: [3], output: 3 },
      { input: [5], output: 8 }
    ],
    hints: [
      "dp[i] = dp[i-1] + dp[i-2]",
      "공간 O(1)로도 가능"
    ]
  },

  {
    id: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    tags: ["DFS", "Grid"],
    entryFn: "num_islands",
    description:
      `"1"(육지)과 "0"(물)로 구성된 그리드에서 섬의 개수를 반환하세요.`,
    starterCode: `def num_islands(grid):
    # grid: List[List[str]]  (예: [["1","1","0"],["0","1","0"],["1","0","1"]])
    # TODO: 방문표시하며 DFS/BFS로 연결된 육지 덩어리 세기
    return 0
`,
    tests: [
      { input: [[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]], output: 1 },
      { input: [[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]], output: 3 }
    ],
    hints: [
      "범위를 벗어나지 않는지 체크",
      "방문 배열 또는 값을 '0'으로 바꾸어 방문 처리"
    ]
  },

  {
    id: "plus-one",
    title: "Plus One",
    difficulty: "Easy",
    tags: ["Array", "Math"],
    entryFn: "plus_one",
    description:
      "비음수 정수를 나타내는 배열 digits에 1을 더한 결과 배열을 반환하세요.",
    starterCode: `def plus_one(digits):
    # TODO: 뒤에서부터 자리올림 처리
    return digits
`,
    tests: [
      { input: [[1,2,3]], output: [1,2,4] },
      { input: [[4,3,2,1]], output: [4,3,2,2] },
      { input: [[9]], output: [1,0] }
    ],
    hints: [
      "9를 만나면 0으로 바꾸고 carry 유지",
      "마지막까지 carry면 맨 앞에 1 추가"
    ]
  },

  {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    tags: ["TwoPointers", "String"],
    entryFn: "is_palindrome_str",
    description:
      "영숫자만 고려하고 대소문자를 무시하여 문자열이 팰린드롬인지 판단하세요.",
    starterCode: `def is_palindrome_str(s: str) -> bool:
    # TODO: 투 포인터로 앞/뒤에서 검사, 영숫자만 고려
    return False
`,
    tests: [
      { input: ["A man, a plan, a canal: Panama"], output: true },
      { input: ["race a car"], output: false },
      { input: [" "], output: true }
    ],
    hints: [
      "문자 필터링 후 소문자 비교",
      "또는 포인터로 유효문자일 때만 비교"
    ]
  },
];

export function getProblem(id: string) {
  return problems.find((p) => p.id === id);
}