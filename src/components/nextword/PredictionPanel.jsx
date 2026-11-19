import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2, Eraser, Wand2 } from "lucide-react";
import Panel from "@/components/Panel";
import ProbabilityBars from "@/components/ProbabilityBars";
import { END, complete, predictNext } from "@/lib/ngram";

function appendToken(text, token, level) {
  if (token === END) return text;
  if (level === "char") return text + token;
  if (/^[.,!?;:]$/.test(token)) return `${text.replace(/\s+$/, "")}${token} `;
  return `${text && !text.endsWith(" ") ? `${text} ` : text}${token} `;
}

function joinText(base, addition, level) {
  if (!addition) return base;
  if (level === "char") return base + addition;
  return `${base}${base && !base.endsWith(" ") ? " " : ""}${addition} `;
}

export default function PredictionPanel({ model, typed, setTyped }) {
  const [temperature, setTemperature] = useState(0.7);
  const [continuing, setContinuing] = useState(false);

  const result = useMemo(() => (model ? predictNext(model, typed, 6) : null), [model, typed]);

  if (!model) {
    return (
      <Panel eyebrow="Step 03" title="Predict the next word">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Train a model and this becomes a live predictor: type a phrase and watch the probability
          of every candidate rise and fall.
        </p>
      </Panel>
    );
  }

  const contextLabel = result.contextUsed.length
    ? result.contextUsed.join(model.level === "char" ? "" : " ")
    : "nothing yet";

  const runContinue = () => {
    setContinuing(true);
    window.setTimeout(() => {
      const addition = complete(model, typed, { maxTokens: 20, temperature });
      setTyped((current) => joinText(current, addition, model.level).trimEnd() + (current ? " " : ""));
      setContinuing(false);
    }, 30);
  };

  return (
    <Panel
      eyebrow="Step 03"
      title="Predict the next word"
      action={
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={() => setTyped("")}
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear
        </Button>
      }
    >
      <Textarea
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        placeholder="Start a sentence — or leave it empty to see how the model opens one…"
        className="thin-scroll min-h-[92px] resize-y bg-background/50 font-mono text-[13px] leading-relaxed"
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
        <span>
          context: <span className="text-foreground">{contextLabel}</span>
        </span>
        <span>{result.candidates} candidates</span>
        <span>{result.backedOff ? "backed off to a shorter context" : "exact context match"}</span>
      </div>

      <div className="mt-5">
        <ProbabilityBars rows={result.predictions} onPick={(token) => setTyped((c) => appendToken(c, token, model.level))} />
        <p className="mt-3 text-[11px] text-muted-foreground">
          Click any candidate to append it and predict again.
        </p>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Temperature
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {temperature.toFixed(2)} · {temperature < 0.15 ? "always the top pick" : temperature > 0.85 ? "adventurous" : "balanced"}
            </p>
          </div>
          <Button variant="secondary" className="gap-2" onClick={runContinue} disabled={continuing}>
            {continuing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            Continue 20 tokens
          </Button>
        </div>
        <Slider
          className="mt-4"
          value={[temperature]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={(values) => setTemperature(values[0])}
        />
      </div>
    </Panel>
  );
}