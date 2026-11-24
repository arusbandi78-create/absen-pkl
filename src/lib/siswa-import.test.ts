import { describe, expect, it } from "vitest";
import { chunkSiswaImportRows, SISWA_IMPORT_BATCH_SIZE } from "./siswa-import";

describe("chunkSiswaImportRows", () => {
  it("keeps each server request within the safe batch size and preserves order", () => {
    const rows = Array.from({ length: SISWA_IMPORT_BATCH_SIZE * 2 + 1 }, (_, index) => index);
    const batches = chunkSiswaImportRows(rows);

    expect(batches.map((batch) => batch.length)).toEqual([SISWA_IMPORT_BATCH_SIZE, SISWA_IMPORT_BATCH_SIZE, 1]);
    expect(batches.flat()).toEqual(rows);
  });

  it("returns no batches for an empty import", () => {
    expect(chunkSiswaImportRows([])).toEqual([]);
  });
});
