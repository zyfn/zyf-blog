import vinext from "vinext";
import { defineConfig } from "vite";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

export default defineConfig(async () => {
  const stripMdxFrontmatter = {
    name: "strip-mdx-frontmatter",
    enforce: "pre" as const,
    transform(value: string, id: string) {
      if (id.includes("?raw") || !id.split("?")[0].endsWith(".mdx") || !value.startsWith("---")) {
        return undefined;
      }
      const end = value.indexOf("\n---", 3);
      return end === -1 ? undefined : { code: value.slice(end + 4).trimStart(), map: null };
    },
  };

  if (process.env.VERCEL === "1" || process.env.NITRO_PRESET === "vercel") {
    const { nitro } = await import("nitro/vite");
    return {
      plugins: [stripMdxFrontmatter, vinext(), nitro()],
    };
  }

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [stripMdxFrontmatter, vinext()],
  };
});
