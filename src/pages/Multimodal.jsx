const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/PageHeader";
import MediaPanel from "@/components/multimodal/MediaPanel";
import AnalysisResult from "@/components/multimodal/AnalysisResult";
import { DEFAULT_CATEGORIES } from "@/lib/samples";
import { extractFrames } from "@/lib/videoFrames";

const kindOf = (type) => {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("video/")) return "video";
  return null;
};

export default function Multimodal() {
  const [file, setFile] = useState(null);
  const [kind, setKind] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [status, setStatus] = useState("idle");
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (next) => {
    setFile(next);
    setKind(kindOf(next.type));
    setResult(null);
    setError(null);
    setStatus("idle");
  };

  const analyse = async () => {
    if (!file || !kind) return;
    const wanted = categories
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (wanted.length < 2) {
      setError("Add at least two categories, separated by commas.");
      setStatus("error");
      return;
    }

    setStatus("working");
    setError(null);
    setResult(null);

    try {
      let uris = [];
      let payloadKind = kind;

      if (kind === "video") {
        setStage("Pulling frames out of your video…");
        const frames = await extractFrames(file, 3);
        setStage("Uploading the sampled frames…");
        const uploaded = await Promise.all(
          frames.map((frame) => db.integrations.Core.UploadPrivateFile({ file: frame }))
        );
        uris = uploaded.map((entry) => entry.file_uri);
        payloadKind = "frames";
      } else {
        setStage("Uploading your file…");
        const uploaded = await db.integrations.Core.UploadPrivateFile({ file });
        uris = [uploaded.file_uri];
      }

      setStage(
        kind === "audio"
          ? "Transcribing the audio, then interpreting it…"
          : "Looking at what is happening…"
      );

      const response = await db.functions.invoke("analyzeMedia", {
        file_uris: uris,
        kind: payloadKind,
        categories: wanted,
      });

      if (response.data && response.data.error) throw new Error(response.data.error);
      setResult(response.data);
      setStatus("done");
    } catch (failure) {
      setError(
        (failure.response && failure.response.data && failure.response.data.error) ||
          failure.message ||
          "Something went wrong while analysing that file."
      );
      setStatus("error");
    } finally {
      setStage("");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Model 03 · multimodal"
        title="Media analyzer"
        description="Hand it an image, an audio clip or a video and it tells you what is happening, then files it under a category you choose. Your uploads stay private to this app."
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <MediaPanel
          file={file}
          kind={kind}
          previewUrl={previewUrl}
          onFile={handleFile}
          categories={categories}
          setCategories={setCategories}
          onAnalyze={analyse}
          status={status}
          stage={stage}
          error={error}
        />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AnalysisResult result={result} />
        </div>
      </div>
    </>
  );
}