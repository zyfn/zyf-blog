import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const root = resolve(import.meta.dirname, "..");
const postsRoot = join(root, "content", "posts");
const errors = [];
const seenSlugs = new Map();

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function report(file, message) {
  errors.push(`${relative(root, file)}: ${message}`);
}

function withoutFencedCode(source) {
  const lines = source.split(/\r?\n/);
  let fence;
  return lines.map((line) => {
    const marker = line.match(/^\s*(```+|~~~+)/)?.[1];
    if (marker && !fence) {
      fence = marker[0];
      return "";
    }
    if (marker && fence === marker[0]) {
      fence = undefined;
      return "";
    }
    return fence ? "" : line;
  }).join("\n");
}

function checkImage(file, slug, src, alt) {
  if (!alt.trim()) report(file, `image ${src} needs meaningful alt text`);
  const prefix = `/images/posts/${slug}/`;
  if (!src.startsWith(prefix)) {
    report(file, `image ${src} must live under ${prefix}`);
    return;
  }
  const asset = join(root, "public", src.slice(1));
  if (!existsSync(asset)) report(file, `image asset does not exist: ${src}`);
}

function checkCodeFences(file, source) {
  let fence;
  source.split(/\r?\n/).forEach((line, index) => {
    const match = line.match(/^\s*(```+|~~~+)(.*)$/);
    if (!match) return;
    const kind = match[1][0];
    if (!fence) {
      fence = kind;
      if (!match[2].trim()) report(file, `code fence on line ${index + 1} must declare a language`);
    } else if (fence === kind) {
      fence = undefined;
    }
  });
  if (fence) report(file, "code fence is not closed");
}

for (const file of walk(postsRoot).filter((path) => extname(path) === ".mdx")) {
  const source = readFileSync(file, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    report(file, "missing YAML frontmatter");
    continue;
  }

  let data;
  try {
    data = parseYaml(match[1]);
  } catch (error) {
    report(file, `invalid YAML frontmatter: ${error.message}`);
    continue;
  }

  const filenameSlug = basename(file, ".mdx");
  const slug = typeof data.slug === "string" && data.slug.trim() ? data.slug.trim() : filenameSlug;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) report(file, `slug must be lowercase kebab-case: ${slug}`);
  if (seenSlugs.has(slug)) report(file, `duplicate slug also used by ${relative(root, seenSlugs.get(slug))}`);
  seenSlugs.set(slug, file);

  for (const field of ["title", "date", "lastmod", "summary"]) {
    if (typeof data[field] !== "string" || !data[field].trim()) report(file, `${field} is required and must be a string`);
  }
  for (const field of ["date", "lastmod"]) {
    if (typeof data[field] === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(data[field])) report(file, `${field} must use YYYY-MM-DD`);
  }
  if (typeof data.summary === "string" && data.summary.length > 180) report(file, "summary must be 180 characters or fewer");
  if (!Array.isArray(data.tags) || data.tags.length < 1 || data.tags.length > 6 || data.tags.some((tag) => typeof tag !== "string" || !tag.trim())) {
    report(file, "tags must contain one to six non-empty strings");
  } else if (new Set(data.tags).size !== data.tags.length) {
    report(file, "tags must not contain duplicates");
  }
  for (const field of ["featured", "draft"]) {
    if (typeof data[field] !== "boolean") report(file, `${field} is required and must be boolean`);
  }
  if (data.cover !== undefined) {
    if (typeof data.cover !== "string" || !data.cover.startsWith(`/images/posts/${slug}/`)) {
      report(file, `cover must live under /images/posts/${slug}/`);
    } else if (!existsSync(join(root, "public", data.cover.slice(1)))) {
      report(file, `cover asset does not exist: ${data.cover}`);
    }
  }

  const body = source.slice(match[0].length);
  checkCodeFences(file, body);
  const prose = withoutFencedCode(body);
  if (/^#\s+/m.test(prose)) report(file, "body must not contain an H1; frontmatter title is the page H1");
  if (/^#{2,4}\s+(?:[一二三四五六七八九十]+、|(?:\d+(?:\.\d+)*|[A-Z]\.\d+)\.?\s+)/m.test(prose)) {
    report(file, "headings must not use manual section numbers");
  }
  if (/^(?:-{3,}|_{3,}|\*{3,})\s*$/m.test(prose)) report(file, "body must not use horizontal rules as section dividers");
  if (/^(?:```|~~~)mermaid\s*$/m.test(body)) report(file, "Mermaid fences are unsupported; publish a static SVG/PNG through Figure");
  if (/<!--[\s\S]*?-->/.test(body)) report(file, "raw HTML comments are invalid MDX; use an MDX comment");
  if (/\/Users\/[^/]+\//.test(body)) report(file, "article contains a personal macOS absolute path; replace it with a portable placeholder");

  for (const image of prose.matchAll(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/g)) {
    checkImage(file, slug, image[2], image[1]);
  }
  for (const figure of prose.matchAll(/<Figure\b([\s\S]*?)\/>/g)) {
    const src = figure[1].match(/\bsrc=["']([^"']+)["']/)?.[1];
    const alt = figure[1].match(/\balt=["']([^"']+)["']/)?.[1];
    if (!src || alt === undefined) report(file, "Figure requires string src and alt properties");
    else checkImage(file, slug, src, alt);
  }
}

if (errors.length) {
  console.error(`Content check failed with ${errors.length} issue${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Content check passed for ${seenSlugs.size} MDX article${seenSlugs.size === 1 ? "" : "s"}.`);
