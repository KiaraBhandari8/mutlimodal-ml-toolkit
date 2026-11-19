import React from "react";
import Panel from "@/components/Panel";
import StatTile from "@/components/StatTile";
import ProbabilityBars from "@/components/ProbabilityBars";

export default function ModelSummary({ model }) {
  const total = model.distribution.reduce((a, item) => a + item.count, 0) || 1;
  const shareRows = model.distribution.map((item) => ({
    token: item.label,
    probability: item.count / total,
  }));

  return (
    <Panel eyebrow="Learned" title="What the model picked up">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile label="Trained on" value={`${model.trainingCount} rows`} />
        <StatTile label="Categories" value={model.labels.length} />
        <StatTile label="Vocabulary" value={model.vocabSize.toLocaleString()} hint="words + pairs" />
        <StatTile
          label="Accuracy"
          value={`${(model.accuracy * 100).toFixed(1)}%`}
          hint={`guessing would score ${(model.chance * 100).toFixed(1)}%`}
        />
      </div>
      <p className="mt-2.5 font-mono text-[11px] text-muted-foreground">
        Measured by {model.accuracyMethod}.
      </p>

      <div className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Rows per category
        </p>
        <div className="mt-3">
          <ProbabilityBars rows={shareRows} limit={8} />
        </div>
      </div>

      <div className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Strongest words per category
        </p>
        <ul className="mt-3 space-y-2.5">
          {model.signals.map((entry) => (
            <li key={entry.label} className="flex flex-wrap items-center gap-2">
              <span className="min-w-[92px] font-mono text-[11px] text-accent">{entry.label}</span>
              {entry.terms.length ? (
                entry.terms.map((term) => (
                  <span
                    key={term}
                    className="rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                  >
                    {term}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground">no distinctive words yet</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}