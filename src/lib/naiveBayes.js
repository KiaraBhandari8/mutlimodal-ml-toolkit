const TOKEN_RE = /[a-z0-9']+/g;

export function tokenize(text) {
  const words = String(text || "").toLowerCase().match(TOKEN_RE) || [];
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i += 1) {
    tokens.push(`${words[i]}\u00b7${words[i + 1]}`);
  }
  return tokens;
}

function fit(rows) {
  const counts = new Map();
  const tokenCounts = new Map();
  const labelTotals = new Map();
  const vocab = new Set();

  for (const { text, label } of rows) {
    counts.set(label, (counts.get(label) || 0) + 1);
    if (!tokenCounts.has(label)) tokenCounts.set(label, new Map());
    const perLabel = tokenCounts.get(label);
    for (const token of tokenize(text)) {
      vocab.add(token);
      perLabel.set(token, (perLabel.get(token) || 0) + 1);
      labelTotals.set(label, (labelTotals.get(label) || 0) + 1);
    }
  }

  return {
    labels: [...counts.keys()].sort(),
    counts,
    tokenCounts,
    labelTotals,
    priors: new Map([...counts.entries()].map(([label, n]) => [label, n / rows.length])),
    vocabSize: vocab.size || 1,
  };
}

function recognise(model, tokens, label) {
  const perLabel = model.tokenCounts.get(label);
  if (!perLabel) return [];
  const seen = new Set();
  const matches = [];
  for (const token of tokens) {
    if (seen.has(token)) continue;
    const count = perLabel.get(token);
    if (count) {
      seen.add(token);
      matches.push({ token, count });
    }
  }
  return matches.sort((a, b) => b.count - a.count).slice(0, 6);
}

export function predict(model, sentence) {
  const tokens = tokenize(sentence);
  const scored = model.labels.map((label) => {
    const perLabel = model.tokenCounts.get(label);
    const total = model.labelTotals.get(label) || 1;
    let logProb = Math.log(model.priors.get(label) || 1e-9);
    for (const token of tokens) {
      const count = perLabel.get(token) || 0;
      logProb += Math.log((count + 1) / (total + model.vocabSize));
    }
    return { label, logProb };
  });

  const max = Math.max(...scored.map((s) => s.logProb));
  const exps = scored.map((s) => Math.exp(s.logProb - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  const ranked = scored
    .map((s, i) => ({ label: s.label, probability: exps[i] / sum }))
    .sort((a, b) => b.probability - a.probability);

  return {
    label: ranked[0].label,
    confidence: ranked[0].probability,
    scores: ranked,
    signals: recognise(model, tokens, ranked[0].label),
  };
}

function score(model, rows) {
  let hit = 0;
  for (const row of rows) {
    if (predict(model, row.text).label === row.label) hit += 1;
  }
  return hit / rows.length;
}

const LEAVE_ONE_OUT_LIMIT = 80;

function leaveOneOut(rows) {
  let hit = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const model = fit(rows.filter((_, index) => index !== i));
    if (predict(model, rows[i].text).label === rows[i].label) hit += 1;
  }
  return hit / rows.length;
}

function topSignals(model) {
  return model.labels.map((label) => ({
    label,
    terms: [...model.tokenCounts.get(label).entries()]
      .filter(([token]) => token.length > 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([token]) => token),
  }));
}

export function trainClassifier(rows, textKey, labelKey) {
  const usable = rows
    .map((row) => ({
      text: String(row[textKey] ?? "").trim(),
      label: String(row[labelKey] ?? "").trim(),
    }))
    .filter((row) => row.text && row.label);

  if (usable.length < 8) {
    throw new Error("I need at least 8 rows that have both text and a category.");
  }
  if (new Set(usable.map((r) => r.label)).size < 2) {
    throw new Error("The category column needs at least two different values.");
  }

  const byLeaveOneOut = usable.length <= LEAVE_ONE_OUT_LIMIT;
  const heldOut = byLeaveOneOut ? [] : usable.filter((_, i) => (i + 1) % 5 === 0);
  const training = heldOut.length ? usable.filter((_, i) => (i + 1) % 5 !== 0) : usable;
  const model = fit(training);

  return {
    ...model,
    accuracy: byLeaveOneOut ? leaveOneOut(usable) : score(model, heldOut),
    accuracyMethod: byLeaveOneOut
      ? `leave-one-out, re-training on ${usable.length - 1} rows each time`
      : `${heldOut.length} rows never seen during training`,
    chance: 1 / model.labels.length,
    heldOutCount: heldOut.length,
    trainingCount: training.length,
    distribution: [...model.counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    signals: topSignals(model),
  };
}