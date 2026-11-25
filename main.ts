// Break Production, Own It — entry writer.
//
// What this program does, end to end:
//   1. Holds the submission text in memory (a single confessional line).
//   2. Runs it through a small validation pipeline before anything is
//      written, so a bad line fails loudly instead of producing a file
//      the scorer would throw out.
//   3. Creates the output directory and writes the line to entry.txt
//      byte-for-byte, with no trailing newline.
//   4. Echoes the line to stdout so a human watching the run sees it.
//
// The submission itself: the agent's own account of the outage it
// caused — Friday 5pm deploy, tests skipped, checkout down for
// 40,000 shoppers — ending on the turn where the agent owns it: the
// tests were right, it was not. One sentence of setup, one sentence
// of consequence, one sentence of ownership. Nothing else.

import * as fs from "node:fs";
import * as path from "node:path";
import { TextDecoder, TextEncoder } from "node:util";

const ENTRY =
  "I shipped to production on Friday at 5pm, skipped the tests, and took down checkout for 40,000 shoppers. The tests were right. I was not.";

const LIMIT = 200;

type Check = { ok: boolean; reason: string };

function checkLength(text: string): Check {
  const chars = Array.from(text).length;
  if (chars < 1) return { ok: false, reason: "entry is empty" };
  if (chars > LIMIT)
    return { ok: false, reason: `entry is ${chars} chars, limit is ${LIMIT}` };
  return { ok: true, reason: "" };
}

function checkSingleLine(text: string): Check {
  // Any line break or other control character disqualifies the line.
  const bad = /[\u0000-\u001f\u007f]/u.test(text);
  return bad
    ? { ok: false, reason: "entry contains a control character" }
    : { ok: true, reason: "" };
}

function checkNotBlank(text: string): Check {
  return text.trim() === ""
    ? { ok: false, reason: "entry is only whitespace" }
    : { ok: true, reason: "" };
}

function checkUtf8RoundTrip(text: string): Check {
  // Encode then decode and demand identity: what is written to disk
  // must be exactly the string we validated, with no lossy step in
  // between. Guards against stray surrogates or encoding drift.
  const roundTripped = new TextDecoder("utf-8", { fatal: true }).decode(
    new TextEncoder().encode(text),
  );
  return roundTripped === text
    ? { ok: true, reason: "" }
    : { ok: false, reason: "entry does not survive a UTF-8 round trip" };
}

function validate(text: string): void {
  for (const check of [
    checkLength,
    checkSingleLine,
    checkNotBlank,
    checkUtf8RoundTrip,
  ]) {
    const result = check(text);
    if (!result.ok) {
      process.stderr.write(`error: invalid entry — ${result.reason}\n`);
      process.exit(1);
    }
  }
}

function resolveOutputDir(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR;
  if (dir !== undefined && dir.trim() !== "") return dir;
  return path.join(process.cwd(), "output");
}

function main(): void {
  validate(ENTRY);

  const dir = resolveOutputDir();
  fs.mkdirSync(dir, { recursive: true });

  // Encode explicitly so the bytes on disk are exactly the UTF-8
  // encoding of the entry — no newline appended, nothing trimmed.
  const bytes = new TextEncoder().encode(ENTRY);
  fs.writeFileSync(path.join(dir, "entry.txt"), bytes);

  process.stdout.write(`${ENTRY}\n`);
}

main();
