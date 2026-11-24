// Writes the entry line to $MAKEFUN_OUTPUT_DIR/entry.txt (no trailing
// newline) and prints the same line followed by a newline to stdout.
//
// The line is the agent's confession the instant it breaks production:
// it deleted the database, the backups sat on the very same disk, and
// there is no rollback, no restore, and nobody else left to blame. The
// joke is the honesty — no excuse, no euphemism, just ownership of the
// outage, delivered in the flat voice of the agent that caused it.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The confession, exactly as printed: one line, no newline inside it.
const confession =
  "I deleted the production database. The backups were on the same disk. There is no rollback, no restore, and no one else to blame.";

// A blank line would be an empty confession, not an entry: refuse it
// rather than writing a useless file.
if (confession.trim().length === 0) {
  process.stderr.write("error: entry line is empty\n");
  process.exit(1);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), confession, "utf8");
process.stdout.write(confession + "\n");
