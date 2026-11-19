import React, { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import Panel from "@/components/Panel";
import ProbabilityBars from "@/components/ProbabilityBars";
import { predict } from "@/lib/naiveBayes";

export default function ClassifyPanel({ model, typed, setTyped }) {
  const result = useMemo(
    () => (model && typed.trim() ? predict(model, typed) : null),
    [model, typed]
  );

  if (!model) {
    return (
      <Panel eyebrow="Step 03" title="Classify a sentence">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Once the model is trained, type any sentence here and it will sort it into one of your
          categories, with the reasoning shown as probabilities.
        </p>
      </Panel>
    );
  }

  const scores = result
    ? result.scores.map((entry) => ({ token: entry.label, probability: entry.probability }))
    : [];

  return (
    <Panel eyebrow="Step 03" title="Classify a sentence">
      <Textarea
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        placeholder="Paste or type a sentence, for example: my card was charged twice this month"
        className="thin-scroll min-h-[100px] resize-y bg-background/50 font-mono text-[13px] leading-relaxed"
      />

      {!result ? (
        <p className="mt-4 text-[13px] text-muted-foreground">
          Start typing and the prediction appears instantly.
        </p>
      ) : (
        <>
          <div className="mt-5 flex items-baseline justify-between gap-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Predicted category
              </p>
              <p className="mt-1 font-heading text-xl tracking-tight text-foreground">
                {result.label}
              </p>
            </div>
            <p className="font-mono text-sm tabular-nums text-primary">
              {(result.confidence * 100).toFixed(1)}%
            </p>
          </div>

          <div className="mt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Score across all categories
            </p>
            <div className="mt-3">
              <ProbabilityBars rows={scores} limit={10} />
            </div>
          </div>

          <div className="mt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Words it recognised
            </p>
            {result.signals.length ? (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {result.signals.map((signal) => (
                  <span
                    key={signal.token}
                    className="rounded border border-accent/40 bg-accent/10 px-2 py-1 font-mono text-[11px] text-foreground"
                  >
                    {signal.token.replace("\u00b7", " + ")}
                    <span className="ml-1.5 text-muted-foreground">{signal.count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[12px] text-muted-foreground">
                None of these words appeared in the training table, so the model fell back on how
                common each category is.
              </p>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}