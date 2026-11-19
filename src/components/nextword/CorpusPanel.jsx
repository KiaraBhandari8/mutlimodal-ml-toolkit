import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileDrop from "@/components/FileDrop";
import Panel from "@/components/Panel";
import { Sparkles } from "lucide-react";

export default function CorpusPanel({ corpus, setCorpus, source, onFile, onSample }) {
  return (
    <Panel
      eyebrow="Step 01"
      title="Provide the training data"
      action={
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={onSample}>
          <Sparkles className="h-3.5 w-3.5" />
          Use sample
        </Button>
      }
    >
      <FileDrop
        accept=".txt,.md,.csv,.json,.tsv"
        hint="Drop your dataset here, or click to choose a file"
        detail="Text · Markdown · CSV · JSON"
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
        value={corpus}
        onChange={(event) => setCorpus(event.target.value)}
        placeholder="Paste sentences, paragraphs or a whole corpus here. One sentence per line gives the cleanest context boundaries."
        className="thin-scroll min-h-[160px] resize-y bg-background/50 font-mono text-[12.5px] leading-relaxed"
      />

      <p className="mt-3 font-mono text-[11px] text-muted-foreground">{source}</p>
    </Panel>
  );
}