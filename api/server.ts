import { type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, sep } from "node:path";

// Handler server TanStack Start / Nitro untuk Vercel (Node.js runtime).
// Impor server output hasil `npm run build` (di-generate di .output/server).
import serverHandler from "../.output/server/index.mjs";

const PUBLIC_DIR = join(process.cwd(), ".output", "public");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".cjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

function toWebRequest(req: IncomingMessage): Request {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);
  const headers = new Headers();
  for (const [key, values] of Object.entries(req.headers ?? {})) {
    if (values === undefined) continue;
    const value = Array.isArray(values) ? values.join(", ") : String(values);
    for (const part of value.split(",")) headers.append(key, part.trim());
  }
  const isBodyMethod = !["GET", "HEAD"].includes(req.method ?? "");
  return new Request(url.toString(), {
    method: req.method ?? "GET",
    headers,
    ...(isBodyMethod ? { body: req as unknown as BodyInit, duplex: "half" } : {}),
  });
}

function isPublicPath(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/assets/") || /\.[\w]+$/.test(pathname);
}

function safePublicPath(pathname: string): string {
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const parts = relative.split(sep).filter((p) => p !== ".." && p !== "." && p !== "");
  return join(PUBLIC_DIR, ...parts);
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const url = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`
    );
    const pathname = normalize(decodeURIComponent(url.pathname));

    // --- Aset statis dari .output/public ---
    if (isPublicPath(pathname)) {
      const filePath = safePublicPath(pathname);
      try {
        await stat(filePath);
        const content = await readFile(filePath);
        const ext = extname(filePath).toLowerCase();
        res.statusCode = 200;
        res.setHeader("content-type", MIME[ext] ?? "application/octet-stream");
        res.setHeader(
          "cache-control",
          ext === ".html" ? "public, max-age=0, must-revalidate" : "public, max-age=31536000, immutable"
        );
        res.end(content);
        return;
      } catch {
        // File tidak ditemukan → lanjut ke SSR
      }
    }

    // --- SSR melalui handler server TanStack Start / Nitro ---
    const request = toWebRequest(req);

    // Beberapa output build men-expor default sebagai object dengan properti fetch.
    const handlerFn = (serverHandler as any)?.default ?? serverHandler;
    const fetchFn = typeof handlerFn.fetch === "function" ? handlerFn.fetch.bind(handlerFn) : handlerFn;

    const response = await fetchFn(
      request,
      {}, // env (Vercel Node.js runtime tidak punya Cloudflare env)
      {}  // ctx
    );

    res.statusCode = response.status ?? 200;
    if (response.headers) {
      for (const [key, value] of response.headers.entries()) {
        // Skip hop-by-hop headers yang bisa menyebabkan error di Vercel
        const lower = key.toLowerCase();
        if (["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade"].includes(lower)) continue;
        res.setHeader(key, value);
      }
    }
    const body = await response.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (error: any) {
    console.error("[vercel api/server]", error?.message ?? error);
    if (!(res as any).headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain");
      res.end("Internal Server Error");
    }
  }
}
