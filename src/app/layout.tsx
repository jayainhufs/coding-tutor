// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "학습자 맞춤형 코딩 AI 튜터",
  description: "코드 피드백/리팩터링/테스트 학습 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex gap-4">
            <Link href="/" className="font-semibold">홈</Link>
            <Link href="/problems">문제 목록</Link>
            <Link href="/solve">Demo(옛 페이지)</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}