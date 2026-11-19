import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import CorpusPanel from "@/components/nextword/CorpusPanel";
import TrainingPanel from "@/components/nextword/TrainingPanel";
import PredictionPanel from "@/components/nextword/PredictionPanel";
import InlineNotice from "@/components/InlineNotice";
import { SAMPLE_CORPUS } from "@/lib/samples";
import { readCorpusFile } from "@/lib/corpusFile";
import { trainNgram } from "@/lib/ngram";

export default function NextWord() {
  const [corpus, setCorpus] = useState("");
  const [source, setSource] = useState("No dataset loaded yet");
  const [level, setLevel] = useState("word");
  const [order, setOrder] = useState(3);
  const [model, setModel] = useState(null);
  const [trainedFrom, setTrainedFrom] = useState("");
  const [typed, setTyped] = useState("");
  const [training, setTraining] = useState(false);
  const [error, setError] = useState(null);
  const [fileNotice, setFileNotice] = useState(null);

  const reset = () => {
    setModel(null);
    setTrainedFrom("");
    setTyped("");
    setError(null);
  };

  const loadSample = () => {
    setCorpus(SAMPLE_CORPUS);
    setSource("Sample dataset · 50 sentences about a harbour town");
    setFileNotice(null);
    reset();
  };

  const loadFile = async (file) => {
    setFileNotice(null);
    try {
      const { text, name, note } = await readCorpusFile(file);
      setCorpus(text);
      setSource(`${name} · ${note}`);
      reset();
    } catch (readError) {
      setFileNotice(readError.message || "I could not read that file.");
    }
  };

  const train = () => {
    if (!corpus.trim()) {
      setError("Load or paste a dataset first.");
      return;
    }
    setError(null);
    setTraining(true);
    window.setTimeout(() => {
      try {
        setModel(trainNgram(corpus, { order, level }));
        setTrainedFrom(corpus);
        setTyped("");
      } catch (trainError) {
        setError(trainError.message || "Training failed on that dataset.");
      } finally {
        setTraining(false);
      }
    }, 40);
  };

  const retrain = () => {
    if (!model) return;
    setTraining(true);
    window.setTimeout(() => {
      try {
        setModel(trainNgram(corpus, { order, level }));
        setTrainedFrom(corpus);
        setTyped("");
      } catch (trainError) {
        setError(trainError.message || "Training failed on that dataset.");
      } finally {
        setTraining(false);
      }
    }, 40);
  };

  const changeLevel = (next) => {
    setLevel(next);
    window.setTimeout(retrain, 0);
  };

  const changeOrder = (next) => {
    setOrder(next);
    window.setTimeout(retrain, 0);
  };

  return (
    <>
      <PageHeader
        eyebrow="Model 01 · language model"
        title="Next-word predictor"
        description="A real n-gram model built from your dataset, entirely in this browser. It counts how often every word follows every context, then turns those counts into probabilities for what comes next."
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <CorpusPanel
            corpus={corpus}
            setCorpus={(value) => {
              setCorpus(value);
              setSource(
                value.trim()
                  ? `Pasted dataset · ${value.length.toLocaleString()} characters`
                  : "No dataset loaded yet"
              );
            }}
            source={source}
            onFile={loadFile}
            onSample={loadSample}
          />
          {fileNotice ? <InlineNotice>{fileNotice}</InlineNotice> : null}
          <TrainingPanel
            corpus={corpus}
            level={level}
            setLevel={changeLevel}
            order={order}
            setOrder={changeOrder}
            onTrain={train}
            model={model}
            training={training}
            error={error}
            dirty={Boolean(model) && trainedFrom !== corpus}
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <PredictionPanel model={model} typed={typed} setTyped={setTyped} />
        </div>
      </div>
    </>
  );
}