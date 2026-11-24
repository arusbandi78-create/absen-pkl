export const SISWA_IMPORT_BATCH_SIZE = 4;

export function chunkSiswaImportRows<T>(rows: T[]): T[][] {
  const batches: T[][] = [];
  for (let start = 0; start < rows.length; start += SISWA_IMPORT_BATCH_SIZE) {
    batches.push(rows.slice(start, start + SISWA_IMPORT_BATCH_SIZE));
  }
  return batches;
}
