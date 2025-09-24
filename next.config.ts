// next.config.ts
import type { NextConfig } from "next";

const nextConfig = {
  // monaco 관련 패키지를 클라이언트 번들에 확실히 포함
  transpilePackages: ["monaco-editor", "@monaco-editor/react"],
} satisfies NextConfig;

export default nextConfig;
