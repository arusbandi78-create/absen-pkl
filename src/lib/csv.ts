export type ParsedCsv = {
  headers: string[];
  rows: string[][];
};

export function parseCsvText(text: string): ParsedCsv {
  const lines = text.replace(/^\uFEFF/, "").split(/\r\n|\n|\r/).filter((line) => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const delimiter = detectDelimiter(lines[0]);
  return {
    headers: parseCsvLine(lines[0], delimiter).map((header) => header.toLowerCase()),
    rows: lines.slice(1).map((line) => parseCsvLine(line, delimiter)),
  };
}

function detectDelimiter(headerLine: string): string {
  return countUnquotedDelimiter(headerLine, ";") > countUnquotedDelimiter(headerLine, ",") ? ";" : ",";
}

function countUnquotedDelimiter(line: string, delimiter: string): number {
  let count = 0;
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const character = line[i];
    if (character === '"' && inQuotes && line[i + 1] === '"') {
      i++;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && character === delimiter) {
      count++;
    }
  }

  return count;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const character = line[i];
    if (inQuotes) {
      if (character === '"' && line[i + 1] === '"') {
        value += '"';
        i++;
      } else if (character === '"') {
        inQuotes = false;
      } else {
        value += character;
      }
    } else if (character === delimiter) {
      values.push(value.trim());
      value = "";
    } else if (character === '"') {
      inQuotes = true;
    } else {
      value += character;
    }
  }

  values.push(value.trim());
  return values;
}
