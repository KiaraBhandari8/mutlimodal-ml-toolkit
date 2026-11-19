export const MAX_CHARS = 400000;

function flatten(value, out) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => flatten(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => flatten(item, out));
}

export async function readCorpusFile(file) {
  let text = await file.text();
  let note = null;

  if (/\.json$/i.test(file.name)) {
    try {
      const out = [];
      flatten(JSON.parse(text), out);
      if (out.length) {
        text = out.join("\n");
        note = `${out.length} text values pulled out of the JSON`;
      }
    } catch {
      note = "Could not read it as JSON — trained on the raw text instead";
    }
  }

  if (text.length > MAX_CHARS) {
    text = text.slice(0, MAX_CHARS);
    note = "Trimmed to the first 400,000 characters";
  }

  return { text, name: file.name, note: note || `${text.length.toLocaleString()} characters` };
}