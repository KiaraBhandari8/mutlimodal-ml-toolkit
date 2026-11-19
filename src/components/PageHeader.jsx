import React from "react";

export default function PageHeader({ eyebrow, title, description, aside }) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-2xl tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {aside}
    </div>
  );
}