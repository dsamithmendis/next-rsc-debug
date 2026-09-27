/**
 * Verifies that each publishable package is actually installable by a consumer.
 *
 * Runs `npm pack --dry-run` and then asserts every `exports` entry point plus
 * the `main`/`types` fields the manifest advertises exists in `dist/`. This
 * catches the class of packaging bugs where a build succeeds but the published
 * tarball is missing an entry point (see CHANGELOG 0.1.2).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// The directory is not derivable from the package name: the unscoped
// `next-rsc-debug` package lives in `packages/next`.
const PACKAGES = [
  { name: "@next-rsc-debug/core", dir: "packages/core" },
  { name: "next-rsc-debug", dir: "packages/next" },
  { name: "@next-rsc-debug/devtools", dir: "packages/devtools" },
];

const failures = [];

/** Collects every filesystem path an `exports` map points at. */
function collectExportTargets(value, acc = []) {
  if (typeof value === "string") {
    acc.push(value);
  } else if (value && typeof value === "object") {
    for (const nested of Object.values(value)) {
      collectExportTargets(nested, acc);
    }
  }
  return acc;
}

for (const { name, dir } of PACKAGES) {
  const pkgDir = join(repoRoot, dir);
  const manifest = JSON.parse(
    readFileSync(join(pkgDir, "package.json"), "utf8"),
  );

  if (manifest.name !== name) {
    failures.push(
      `${dir}: expected package "${name}", found "${manifest.name}"`,
    );
    continue;
  }

  let stdout;
  try {
    stdout = execFileSync("npm", ["pack", "--dry-run", "--json"], {
      cwd: pkgDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    failures.push(
      `${name}: npm pack failed (${error.status ?? "no status"}): ${String(error.stderr ?? error.message).trim()}`,
    );
    continue;
  }

  // npm may prefix its JSON with progress output, so start at the array.
  const jsonStart = stdout.indexOf("[");
  if (jsonStart === -1) {
    failures.push(`${name}: npm pack produced no JSON output`);
    continue;
  }

  const [tarball] = JSON.parse(stdout.slice(jsonStart));
  if (!tarball || !Array.isArray(tarball.files)) {
    failures.push(`${name}: npm pack produced no file list`);
    continue;
  }

  const declared = [
    ...collectExportTargets(manifest.exports ?? {}),
    ...[manifest.main, manifest.types].filter(Boolean),
  ];

  // Every declared entry point must also survive into the tarball itself.
  // npm reports tarball-relative paths (no `package/` prefix, no `./`), while
  // `exports`/`main`/`types` are written as `./dist/...`, so normalise both.
  const packed = new Set(tarball.files.map((f) => f.path.replace(/^\.\//, "")));
  for (const target of declared) {
    const normalized = target.replace(/^\.\//, "");
    if (!existsSync(join(pkgDir, normalized))) {
      failures.push(
        `${name}: declared entry point "${target}" is missing from dist/`,
      );
    }
    if (!packed.has(normalized)) {
      failures.push(
        `${name}: "${target}" is not included in the published tarball`,
      );
    }
  }

  const version = manifest.version ?? "(none)";
  const dupes = declared.length - new Set(declared).size;
  console.log(
    `✓ ${name}@${version} (${tarball.files.length} files, ${new Set(declared).size} entry points${dupes > 0 ? `, ${dupes} duplicate` : ""})`,
  );
}

if (failures.length > 0) {
  console.error("\nPackaging verification failed:");
  for (const failure of failures) {
    console.error(`  ✗ ${failure}`);
  }
  process.exit(1);
}

console.log("\nAll publishable packages are correctly packed.");
