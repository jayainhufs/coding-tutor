import Link from "next/link";
import { problems } from "@/data/problems";

export default function ProblemsPage() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">문제 목록</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {problems.map((p) => (
          <Link key={p.id} href={`/problems/${p.id}`} className="border rounded-xl p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium">{p.title}</div>
              <span className="text-xs px-2 py-0.5 rounded border">{p.difficulty}</span>
            </div>
            <div className="text-xs text-muted-foreground">{p.tags.join(" · ")}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}