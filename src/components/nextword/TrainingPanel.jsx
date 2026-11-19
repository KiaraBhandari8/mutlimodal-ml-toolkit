import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import Panel from "@/components/Panel";
import StatTile from "@/components/StatTile";
import InlineNotice from "@/components/InlineNotice";
import { cn } from "@/lib/utils";

const LEVELS = [
  { id: "word", label: "Word level" },
  { id: "char", label: "Character level" },
];

const asPercent = (value) => (value == null ? "—" : `${(value * 100).toFixed(1)}%`);

export default function TrainingPanel({
  corpus,
  level,
  setLevel,
  order,
  setOrder,
  onTrain,
  model,
  training,
  error,
  dirty,
}) {
  return (
    <Panel eyebrow="Step 02" title="Train the model">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Prediction mode
          </Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {LEVELS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLevel(option.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-[13px] transition-colors duration-200",
                  level === option.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Context window
          </Label>
          <Select value={String(order)} onValueChange={(value) => setOrder(Number(value))}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {`Look back ${n - 1} ${n - 1 === 1 ? "token" : "tokens"}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
        <Button onClick={onTrain} disabled={training || !corpus.trim()} className="gap-2">
          {training ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {model ? "Retrain" : "Train model"}
        </Button>
        <p className="font-mono text-[11px] text-muted-foreground">
          {corpus.trim()
            ? `${corpus.length.toLocaleString()} characters ready`
            : "No dataset loaded yet"}
        </p>
      </div>

      {error ? (
        <div className="mt-4">
          <InlineNotice>{error}</InlineNotice>
        </div>
      ) : null}

      {dirty && model && !error ? (
        <div className="mt-4">
          <InlineNotice tone="info">
            The dataset changed since the last run — retrain to include it.
          </InlineNotice>
        </div>
      ) : null}

      {model ? (
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <StatTile label="Tokens" value={model.tokenCount.toLocaleString()} />
          <StatTile
            label="Vocabulary"
            value={model.vocab.toLocaleString()}
            hint={model.level === "char" ? "distinct characters" : "distinct words"}
          />
          <StatTile label="Contexts" value={model.distinctContexts.toLocaleString()} />
          <StatTile label="Sentences" value={model.sentenceCount.toLocaleString()} />
          <StatTile
            label="Top-1 hit rate"
            value={asPercent(model.metrics ? model.metrics.top1 : null)}
            hint={model.metrics ? "on held-out text" : "needs 40+ sentences"}
          />
          <StatTile
            label="Top-3 hit rate"
            value={asPercent(model.metrics ? model.metrics.top3 : null)}
            hint={model.metrics ? `${model.metrics.scored} words scored` : "needs 40+ sentences"}
          />
        </div>
      ) : null}
    </Panel>
  );
}