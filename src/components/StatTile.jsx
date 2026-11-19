import React from "react";

export default function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-base tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}