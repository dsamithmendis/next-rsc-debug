import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Copies static assets that `tsc` does not emit into dist/.
 * Consumers import these via the "./styles.css" export.
 */

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(packageRoot, "dist");

await mkdir(dist, { recursive: true });
await copyFile(
  join(packageRoot, "src", "styles.css"),
  join(dist, "styles.css"),
);
