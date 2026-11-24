// Writes the entry line to $MAKEFUN_OUTPUT_DIR/entry.txt (no trailing
// newline) and prints the same line followed by a newline to stdout.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const line =
  "I deleted the production database. The backups were on the same disk. There is no rollback, no restore, and no one else to blame.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), line, "utf8");
process.stdout.write(line + "\n");
