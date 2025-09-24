import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary";
};

export function Button({ className = "", variant = "default", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm border";
  const styles =
    variant === "secondary"
      ? "bg-white text-black border-gray-300 hover:bg-gray-50"
      : "bg-black text-white border-black hover:opacity-90";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
export default Button;