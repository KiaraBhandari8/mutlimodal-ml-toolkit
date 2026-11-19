import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ScanEye } from "lucide-react";
import Panel from "@/components/Panel";
import FileDrop from "@/components/FileDrop";
import InlineNotice from "@/components/InlineNotice";

function Preview({ kind, url, name }) {
  if (!url) return null;
  if (kind === "audio") {
    return (
      <div className="mt-4 rounded-lg border border-border bg-background/50 p-3">
        <p className="mb-2 truncate font-mono text-[11px] text-muted-foreground">{name}</p>
        <audio src={url} controls className="w-full" />
      </div>
    );
  }
  if (kind === "video") {
    return (
      <video
        src={url}
        controls
        className="mt-4 max-h-[260px] w-full rounded-lg border border-border bg-black"
      />
    );
  }
  return (
    <img
      src={url}
      alt={name}
      className="mt-4 max-h-[260px] w-full rounded-lg border border-border object-contain"
    />
  );
}

export default function MediaPanel({
  file,
  kind,
  previewUrl,
  onFile,
  categories,
  setCategories,
  onAnalyze,
  status,
  stage,
  error,
}) {
  const working = status === "working";
  const chips = categories
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    <Panel eyebrow="Step 01" title="Give it something to look at">
      <FileDrop
        accept="image/*,audio/*,video/*"
        hint="Drop an image, audio clip or video here"
        detail="JPG · PNG · WEBP · MP3 · WAV · M4A · MP4 · MOV"
        onFile={onFile}
      />

      {file ? <Preview kind={kind} url={previewUrl} name={file.name} /> : null}

      {file && !kind ? (
        <div className="mt-4">
          <InlineNotice>I can read image, audio and video files only.</InlineNotice>
        </div>
      ) : null}

      <div className="mt-6">
        <Label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Categories to sort into
        </Label>
        <Textarea
          value={categories}
          onChange={(event) => setCategories(event.target.value)}
          className="thin-scroll mt-2 min-h-[70px] resize-y bg-background/50 font-mono text-[12.5px] leading-relaxed"
        />
        {chips.length ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Separate at least two categories with commas.
          </p>
        )}
      </div>

      <Button
        className="mt-5 w-full gap-2 sm:w-auto"
        onClick={onAnalyze}
        disabled={!file || !kind || working}
      >
        {working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanEye className="h-3.5 w-3.5" />}
        {working ? "Analysing…" : "Describe and classify"}
      </Button>

      {working && stage ? (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">{stage}</p>
      ) : null}

      {error ? (
        <div className="mt-4">
          <InlineNotice>{error}</InlineNotice>
        </div>
      ) : null}

      <ul className="mt-6 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <li>· Images are read directly, so the description comes from what is visible in the frame.</li>
        <li>· Video is sampled into three frames and described from those.</li>
        <li>· Audio is transcribed first, then described and classified from the transcript.</li>
      </ul>
    </Panel>
  );
}