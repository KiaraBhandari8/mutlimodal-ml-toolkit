import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileDrop({ accept, hint, detail, onFile, className }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const take = (file) => {
    if (file) onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current && inputRef.current.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        take(event.dataTransfer.files && event.dataTransfer.files[0]);
      }}
      className={cn(
        "cursor-pointer rounded-lg border border-dashed px-4 py-6 text-center transition-colors duration-200",
        over ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50",
        className
      )}
    >
      <Upload className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="mt-2 text-sm text-foreground">{hint}</p>
      {detail ? (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {detail}
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          take(event.target.files && event.target.files[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}