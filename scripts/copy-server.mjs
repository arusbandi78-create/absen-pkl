import { cp } from "node:fs/promises";

async function main() {
  await cp(".output/server", "api/server", { recursive: true });
  console.log("[copy-server] .output/server → api/server OK");
}

main().catch((err) => {
  console.error("[copy-server]", err);
  process.exit(1);
});
