import React from "react";
import { END } from "@/lib/ngram";

const display = (token) => (token === END ? "\u27e8end\u27e9" : token);

export default function ProbabilityBars({ rows, onPick, limit = 6 }) {
  const top = rows.slice(0, limit);
  if (!top.length) return null;
  const scale = top[0].probability || 1;

  return (
    <ul className="space-y-2.5">
      {top.map((row) => (
        <li key={row.token}>
          <button
            type="button"
            disabled={!onPick}
            onClick={() => onPick && onPick(row.token)}
            className="group w-full text-left disabled:cursor-default"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-sm text-foreground transition-colors group-enabled:group-hover:text-primary">
                {display(row.token)}
              </span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {(row.probability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${Math.max(2, (row.probability / scale) * 100)}%` }}
              />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}