import * as React from "react";

type Props = React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" };

export function Badge({ className = "", variant = "default", ...props }: Props) {
  const base = "inline-block rounded border px-2 py-0.5 text-xs";
  const styles = variant === "secondary" ? "bg-gray-100 border-gray-300" : "bg-black text-white border-black";
  return <span className={`${base} ${styles} ${className}`} {...props} />;
}