import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import Panel from "@/components/Panel";
import FileDrop from "@/components/FileDrop";
import InlineNotice from "@/components/InlineNotice";
import { cn } from "@/lib/utils";

const PREVIEW_ROWS = 8;

export default function DatasetPanel({
  parsed,
  raw,
  setRaw,
  source,
  onFile,
  onSample,
  textKey,
  setTextKey,
  labelKey,
  setLabelKey,
  onTrain,
  model,
  error,
}) {
  const columns = parsed.headers;
  const preview = parsed.rows.slice(0, PREVIEW_ROWS);

  const columnSelect = (value, onChange, disabledKey) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="mt-2">
        <SelectValue placeholder="Choose a column" />
      </SelectTrigger>
      <SelectContent>
        {columns.map((header) => (
          <SelectItem key={header} value={header} disabled={header === disabledKey}>
            {header}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <Panel
      eyebrow="Step 01"
      title="Load the table"
      action={
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={onSample}>
          <Sparkles className="h-3.5 w-3.5" />
          Use sample
        </Button>
      }
    >
      <FileDrop
        accept=".csv,.tsv,.txt"
        hint="Drop your CSV here, or click to choose a file"
        detail="Comma, semicolon or tab separated"
        onFile={onFile}
      />

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          or paste
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Textarea
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        placeholder="id,text,category&#10;1,The parcel never arrived,Shipping"
        className="thin-scroll min-h-[110px] resize-y bg-background/50 font-mono text-[12px] leading-relaxed"
      />

      <p className="mt-3 font-mono text-[11px] text-muted-foreground">{source}</p>

      {error ? (
        <div className="mt-4">
          <InlineNotice>{error}</InlineNotice>
        </div>
      ) : null}

      {columns.length ? (
        <>
          <div className="mt-6 overflow-hidden rounded-lg border border-border">
            <div className="thin-scroll max-h-[280px] overflow-auto">
              <table className="w-full border-collapse text-left text-[12px]">
                <thead className="sticky top-0 bg-secondary">
                  <tr>
                    {columns.map((header) => (
                      <th
                        key={header}
                        className={cn(
                          "whitespace-nowrap border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em]",
                          header === labelKey && "text-accent",
                          header === textKey && "text-primary",
                          header !== labelKey && header !== textKey && "text-muted-foreground"
                        )}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index} className="border-b border-border/60 last:border-0">
                      {columns.map((header) => (
                        <td
                          key={header}
                          className="max-w-[220px] truncate px-3 py-2 align-top text-muted-foreground"
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            Showing {preview.length} of {parsed.rows.length.toLocaleString()} rows ·{" "}
            {columns.length} columns
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Sentence column
              </Label>
              {columnSelect(textKey, setTextKey, labelKey)}
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Category column
              </Label>
              {columnSelect(labelKey, setLabelKey, textKey)}
            </div>
          </div>

          <Button className="mt-5" onClick={onTrain} disabled={!textKey || !labelKey}>
            {model ? "Retrain model" : "Train model"}
          </Button>
        </>
      ) : (
        <div className="mt-5">
          <InlineNotice tone="info">
            Load a table and it will appear here, ready to train on.
          </InlineNotice>
        </div>
      )}
    </Panel>
  );
}