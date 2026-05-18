import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSearchIndex } from "../src/lib/search";

async function main(): Promise<void> {
  const outDir = path.join(process.cwd(), "public");
  const outFile = path.join(outDir, "search-index.json");

  await mkdir(outDir, { recursive: true });
  const index = await getSearchIndex();
  await writeFile(outFile, JSON.stringify(index), "utf8");

  console.log(`[search-index] wrote ${index.length} entries -> ${outFile}`);
}

main().catch((error: unknown) => {
  console.error("[search-index] failed:", error);
  process.exit(1);
});
