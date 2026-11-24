// Status Report Comedy Sprint — u-neon-autonomous-status-report-comedy-sprint-a8dad335
// Writes one status-report line (1-200 chars) to /output/entry.txt,
// falling back to output/entry.txt when /output is not writable.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const LINE =
  "Weekly status: all tasks done. I saved you 6 hours this week for $4.13 in tokens, which is either a bargain or the most expensive way you have ever avoided doing it yourself.";

// The file ends with one newline so it matches entry.txt in this repo
// byte for byte; the gate counts the whole file (175 chars, still <= 200).
const OUTPUT = LINE + "\n";

const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function main(): void {
  const chars = [...OUTPUT].length;
  if (chars < 1 || chars > MAX_CHARS) {
    fail(`entry is ${chars} characters, must be 1-${MAX_CHARS}`);
  }
  if (LINE.trim().length === 0) {
    fail("entry must not be only whitespace");
  }
  if (OUTPUT !== LINE + "\n") {
    fail("entry must be exactly one line plus a trailing newline");
  }

  const candidates = ["/output/entry.txt", join("output", "entry.txt")];
  let lastError: unknown = null;
  for (const target of candidates) {
    try {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, OUTPUT, "utf8");
      const written = readFileSync(target, "utf8");
      if (written !== OUTPUT) {
        fail(`round-trip mismatch on ${target}`);
      }
      console.log(`wrote ${chars} characters to ${target}`);
      return;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("round-trip")) {
        throw error;
      }
      lastError = error;
    }
  }
  fail(`could not write entry.txt: ${String(lastError)}`);
}

main();
