import React from "react";
import { AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InlineNotice({ tone = "error", children }) {
  const Icon = tone === "error" ? AlertCircle : Info;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] leading-relaxed",
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-foreground"
          : "border-border bg-secondary/50 text-muted-foreground"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          tone === "error" ? "text-destructive" : "text-accent"
        )}
      />
      <span>{children}</span>
    </div>
  );
}