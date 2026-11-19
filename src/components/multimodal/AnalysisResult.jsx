import React from "react";
import Panel from "@/components/Panel";

export default function AnalysisResult({ result }) {
  if (!result) {
    return (
      <Panel eyebrow="Step 02" title="What is happening">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The description and the category it was sorted into will appear here.
        </p>
      </Panel>
    );
  }

  const confidence = Math.round((Number(result.confidence) || 0) * 100);

  return (
    <Panel eyebrow="Step 02" title="What is happening">
      <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Category
            </p>
            <p className="mt-1 font-heading text-xl tracking-tight text-foreground">
              {result.category || "Unclassified"}
            </p>
          </div>
          <p className="font-mono text-sm tabular-nums text-primary">{confidence}%</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
            style={{ width: `${Math.max(3, Math.min(100, confidence))}%` }}
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Description
        </p>
        <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-foreground">
          {result.description || "No description came back."}
        </p>
      </div>

      {result.observations && result.observations.length ? (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Why that category
          </p>
          <ul className="mt-2 space-y-2">
            {result.observations.map((item, index) => (
              <li key={index} className="flex gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.transcript ? (
        <div className="mt-5 border-t border-border pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Transcript
          </p>
          <p className="thin-scroll mt-2 max-h-40 overflow-auto whitespace-pre-line font-mono text-[12px] leading-relaxed text-muted-foreground">
            {result.transcript}
          </p>
        </div>
      ) : null}
    </Panel>
  );
}