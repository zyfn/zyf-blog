export {};

declare global {
  namespace Cloudflare {
    interface Env {
      ASSETS: Fetcher;
      DB: D1Database;
    }
  }
}
