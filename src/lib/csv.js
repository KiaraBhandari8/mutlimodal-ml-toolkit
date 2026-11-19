const DELIMITERS = [",", ";", "\t", "|"];

function detectDelimiter(line) {
  let best = ",";
  let bestCount = 0;
  for (const candidate of DELIMITERS) {
    const count = line.split(candidate).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = candidate;
    }
  }
  return best;
}

export function parseCSV(input) {
  const text = String(input || "").replace(/^\uFEFF/, "");
  const firstLine = text.split(/\r?\n/)[0] || "";
  const delimiter = detectDelimiter(firstLine);

  const grid = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      grid.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    grid.push(row);
  }

  const clean = grid.filter((cells) => cells.some((cell) => cell.trim() !== ""));
  if (!clean.length) return { headers: [], rows: [], delimiter };

  const headers = clean[0].map((header, i) => header.trim() || `Column ${i + 1}`);
  const rows = clean.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, i) => {
      record[header] = (cells[i] ?? "").trim();
    });
    return record;
  });

  return { headers, rows, delimiter };
}

export function guessColumns(headers, rows) {
  const stats = headers.map((header) => {
    const values = rows.map((row) => row[header] ?? "");
    const distinct = new Set(values).size;
    const avgLength = values.reduce((a, v) => a + v.length, 0) / (values.length || 1);
    return { header, distinct, avgLength };
  });

  const maxDistinct = Math.max(2, Math.floor(rows.length * 0.6));
  const labelCandidate = stats
    .filter((s) => s.distinct >= 2 && s.distinct <= maxDistinct && s.avgLength < 32)
    .sort((a, b) => a.avgLength - b.avgLength || a.distinct - b.distinct)[0];

  const labelKey = labelCandidate ? labelCandidate.header : headers[headers.length - 1];
  const textCandidate = stats
    .filter((s) => s.header !== labelKey)
    .sort((a, b) => b.avgLength - a.avgLength)[0];

  return { textKey: textCandidate ? textCandidate.header : null, labelKey };
}