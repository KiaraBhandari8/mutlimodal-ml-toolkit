import React from "react";
import { cn } from "@/lib/utils";

export default function Panel({ eyebrow, title, action, children, className }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card/70 p-5 backdrop-blur-sm sm:p-6",
        className
      )}
    >
      {eyebrow || title || action ? (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-1 font-heading text-base tracking-tight text-foreground">{title}</h2>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}