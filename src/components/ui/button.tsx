import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50",
        variant === "primary" &&
          "bg-accent text-accent-foreground hover:bg-[#c41010]",
        variant === "secondary" &&
          "border border-border bg-surface text-foreground hover:border-accent",
        variant === "ghost" && "text-foreground hover:text-accent",
        className,
      )}
      {...props}
    />
  );
}
