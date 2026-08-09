import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the generic blog home", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>NOTES\.｜文章与教程<\/title>/i);
  assert.match(html, /文章、教程/);
  assert.match(html, /长期笔记/);
  assert.match(html, /href="\/posts"/);
  assert.match(html, /href="\/write"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("keeps the site topic-neutral and includes a real publishing flow", async () => {
  const [home, writer, schema, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/WriterForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(home, /A QUIET PLACE FOR IDEAS/);
  assert.match(home, /写技术，也写任何值得反复阅读的内容/);
  assert.doesNotMatch(home, /Agent 工程志|把 Agent 真正带进研发/);
  assert.match(writer, /\.md,\.markdown,\.txt/);
  assert.match(writer, /保存草稿/);
  assert.match(writer, /发布文章/);
  assert.match(schema, /blog_posts/);
  assert.match(schema, /status/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og.png", import.meta.url));
});
