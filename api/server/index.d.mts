// Deklarasi tipe untuk handler hasil build TanStack Start / Nitro yang
// di-copy oleh scripts/copy-server.mjs ke api/server/index.mjs.
// File ini di-commit (lihat pengecualian di .gitignore) supaya type-check
// Vercel tidak gagal dengan TS2307 saat mengompilasi api/server.ts.

type NitroFetch = (
  request: Request,
  env?: unknown,
  ctx?: unknown
) => Promise<Response>;

declare const serverHandler:
  | NitroFetch
  | {
      default?: NitroFetch;
      fetch?: NitroFetch;
    };

export default serverHandler;