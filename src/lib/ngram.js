export const START = "<s>";
export const END = "</s>";
export const MAX_ORDER = 5;

const SEP = "\u0001";
const WORD_RE = /[A-Za-z0-9']+|[^\sA-Za-z0-9']/g;
const MAX_EVAL_POSITIONS = 600;

export function toWords(text) {
  return String(text || "")
    .toLowerCase()
    .match(WORD_RE) || [];
}

function toChars(text) {
  return Array.from(String(text || "").toLowerCase().replace(/\s+/g, " "));
}

function tokenizerFor(level) {
  return level === "char" ? toChars : toWords;
}

export function splitSentences(text) {
  return String(text || "")
    .split(/\r?\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.replace(/[^A-Za-z0-9]/g, "").length > 1);
}

const contextKey = (tokens) => tokens.join(SEP);

function buildModel(sentences, order, level) {
  const counts = new Map();
  const totals = new Map();
  const unigram = new Map();
  const width = order - 1;
  let tokenCount = 0;

  for (const tokens of sentences) {
    tokenCount += tokens.length;
    const sequence = [...new Array(width).fill(START), ...tokens, END];
    for (let i = width; i < sequence.length; i += 1) {
      const next = sequence[i];
      unigram.set(next, (unigram.get(next) || 0) + 1);
      const key = contextKey(sequence.slice(i - width, i));
      let dist = counts.get(key);
      if (!dist) {
        dist = new Map();
        counts.set(key, dist);
      }
      dist.set(next, (dist.get(next) || 0) + 1);
      totals.set(key, (totals.get(key) || 0) + 1);
    }
  }

  return {
    order,
    level,
    counts,
    totals,
    unigram,
    unigramTotal: [...unigram.values()].reduce((a, b) => a + b, 0),
    tokenCount,
    sentenceCount: sentences.length,
    distinctContexts: counts.size,
    vocab: unigram.size,
  };
}

function lookup(model, context) {
  let ctx = context.slice(-(model.order - 1));
  for (;;) {
    const key = contextKey(ctx);
    const dist = model.counts.get(key);
    if (dist) return { dist, total: model.totals.get(key), context: ctx };
    if (ctx.length === 0) return null;
    ctx = ctx.slice(1);
  }
}

export function predictNext(model, text, k = 6) {
  const typed = tokenizerFor(model.level)(text);
  const width = model.order - 1;
  const context =
    typed.length >= width
      ? typed.slice(-width)
      : [...new Array(width - typed.length).fill(START), ...typed];

  const found = lookup(model, context);
  let rows;
  if (found) {
    rows = [...found.dist.entries()].map(([token, count]) => ({
      token,
      count,
      probability: count / found.total,
    }));
  } else {
    rows = [...model.unigram.entries()].map(([token, count]) => ({
      token,
      count,
      probability: count / (model.unigramTotal || 1),
    }));
  }
  rows.sort((a, b) => b.probability - a.probability || b.count - a.count);

  return {
    predictions: rows.slice(0, k),
    candidates: rows.length,
    contextUsed: found ? found.context : [],
    backedOff: !found || found.context.length < context.length,
  };
}

function weightedPick(rows, temperature) {
  const weights = rows.map((row) => Math.pow(Math.max(row.probability, 1e-9), 1 / temperature));
  const total = weights.reduce((a, b) => a + b, 0);
  let ticket = Math.random() * total;
  for (let i = 0; i < rows.length; i += 1) {
    ticket -= weights[i];
    if (ticket <= 0) return rows[i];
  }
  return rows[rows.length - 1];
}

export function complete(model, seedText, { maxTokens = 24, temperature = 0.7 } = {}) {
  const tokens = tokenizerFor(model.level)(seedText);
  const produced = [];
  for (let i = 0; i < maxTokens; i += 1) {
    const typed = model.level === "char" ? tokens.join("") : tokens.join(" ");
    const { predictions } = predictNext(model, typed, 12);
    if (!predictions.length) break;
    const pick = temperature <= 0.05 ? predictions[0] : weightedPick(predictions, temperature);
    if (!pick || pick.token === END) break;
    tokens.push(pick.token);
    produced.push(pick.token);
  }
  return model.level === "char" ? produced.join("") : produced.join(" ");
}

function scoreHeldOut(model, sentences) {
  const tokenize = tokenizerFor(model.level);
  let budget = MAX_EVAL_POSITIONS;
  let top1 = 0;
  let top3 = 0;
  let scored = 0;

  outer: for (const sentence of sentences) {
    const tokens = tokenize(sentence);
    for (let i = 0; i < tokens.length; i += 1) {
      if (budget <= 0) break outer;
      budget -= 1;
      const prefix = tokens.slice(0, i);
      const typed = model.level === "char" ? prefix.join("") : prefix.join(" ");
      const { predictions } = predictNext(model, typed, 3);
      scored += 1;
      if (predictions[0] && predictions[0].token === tokens[i]) top1 += 1;
      if (predictions.some((p) => p.token === tokens[i])) top3 += 1;
    }
  }

  if (!scored) return null;
  return { top1: top1 / scored, top3: top3 / scored, scored };
}

export function trainNgram(text, { order = 3, level = "word" } = {}) {
  const safeOrder = Math.max(2, Math.min(MAX_ORDER, Number(order) || 3));
  const tokenize = tokenizerFor(level);
  const sentences = splitSentences(text)
    .map((sentence) => tokenize(sentence))
    .filter((tokens) => tokens.length > 0);

  if (!sentences.length) throw new Error("I could not find any usable text to train on.");

  const split = sentences.length >= 40;
  const heldOut = split ? sentences.filter((_, i) => (i + 1) % 10 === 0) : [];
  const training = split ? sentences.filter((_, i) => (i + 1) % 10 !== 0) : sentences;
  const model = buildModel(training, safeOrder, level);
  const metrics = heldOut.length ? scoreHeldOut(model, heldOut.slice(0, 40)) : null;

  return {
    ...model,
    metrics,
    heldOutSentences: heldOut.length,
    truncated: sentences.length === 1,
  };
}