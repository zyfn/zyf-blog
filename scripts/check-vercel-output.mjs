import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const functionsRoot = join(root, ".vercel", "output", "functions");
const suspiciousExports = ["rsc_exports", "ssr_exports"];
const errors = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

for (const file of walk(functionsRoot).filter((path) => extname(path) === ".mjs")) {
  const source = readFileSync(file, "utf8");

  for (const name of suspiciousExports) {
    const exported = new RegExp(`\\b${name}\\s+as\\b`).test(source);
    if (!exported) continue;

    const declared = new RegExp(`\\b(?:var|let|const|function|class)\\s+${name}\\b`).test(source);
    const imported = new RegExp(`\\bimport\\s*\\{[^}]*\\b${name}\\b`, "s").test(source);
    if (!declared && !imported) {
      errors.push(`${relative(root, file)} exports undefined ${name}`);
    }
  }
}

if (errors.length) {
  console.error("Vercel output check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Vercel output check passed.");
