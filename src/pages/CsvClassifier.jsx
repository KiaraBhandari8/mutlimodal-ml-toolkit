import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import InlineNotice from "@/components/InlineNotice";
import DatasetPanel from "@/components/classifier/DatasetPanel";
import ModelSummary from "@/components/classifier/ModelSummary";
import ClassifyPanel from "@/components/classifier/ClassifyPanel";
import { SAMPLE_CSV } from "@/lib/samples";
import { guessColumns, parseCSV } from "@/lib/csv";
import { trainClassifier } from "@/lib/naiveBayes";

const MAX_ROWS = 5000;

export default function CsvClassifier() {
  const [raw, setRaw] = useState("");
  const [source, setSource] = useState("No table loaded yet");
  const [textKey, setTextKey] = useState("");
  const [labelKey, setLabelKey] = useState("");
  const [model, setModel] = useState(null);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState(null);
  const [fileNotice, setFileNotice] = useState(null);

  const parsed = useMemo(() => parseCSV(raw), [raw]);
  const rows = useMemo(() => parsed.rows.slice(0, MAX_ROWS), [parsed]);

  useEffect(() => {
    if (!parsed.headers.length) return;
    const guess = guessColumns(parsed.headers, rows);
    setTextKey(guess.textKey || parsed.headers[0]);
    setLabelKey(guess.labelKey || parsed.headers[parsed.headers.length - 1]);
    setModel(null);
    setTyped("");
    setError(null);
  }, [parsed, rows]);

  const loadSample = () => {
    setRaw(SAMPLE_CSV);
    setSource("Sample table · 32 support tickets across 4 categories");
    setFileNotice(null);
  };

  const loadFile = async (file) => {
    setFileNotice(null);
    try {
      const text = await file.text();
      setRaw(text);
      setSource(`${file.name} · ${text.length.toLocaleString()} characters`);
    } catch (readError) {
      setFileNotice(readError.message || "I could not read that file.");
    }
  };

  const train = () => {
    if (!textKey || !labelKey) {
      setError("Choose which column holds the sentence and which holds the category.");
      return;
    }
    try {
      setModel(trainClassifier(rows, textKey, labelKey));
      setTyped("");
      setError(null);
    } catch (trainError) {
      setModel(null);
      setError(trainError.message || "Training failed on that table.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Model 02 · text classifier"
        title="CSV category classifier"
        description="Point it at a CSV, choose the sentence column and the category column, and it learns the wording of each category from your rows. Then any sentence you type gets sorted into one of them, with the arithmetic shown."
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <DatasetPanel
          parsed={parsed}
          raw={raw}
          setRaw={(value) => {
            setRaw(value);
            setSource(
              value.trim()
                ? `Pasted table · ${value.length.toLocaleString()} characters`
                : "No table loaded yet"
            );
          }}
          source={source}
          onFile={loadFile}
          onSample={loadSample}
          textKey={textKey}
          setTextKey={setTextKey}
          labelKey={labelKey}
          setLabelKey={setLabelKey}
          onTrain={train}
          model={model}
          error={error}
        />

        <div className="space-y-6">
          {fileNotice ? <InlineNotice>{fileNotice}</InlineNotice> : null}
          {model ? <ModelSummary model={model} /> : null}
          <ClassifyPanel model={model} typed={typed} setTyped={setTyped} />
        </div>
      </div>
    </>
  );
}