// Each recipient can trigger several Supabase and Fonnte requests per stage.
export const WA_TEST_BATCH_SIZE = 3;

export function chunkWaTestUserIds(userIds: string[]): string[][] {
  const batches: string[][] = [];
  for (let start = 0; start < userIds.length; start += WA_TEST_BATCH_SIZE) {
    batches.push(userIds.slice(start, start + WA_TEST_BATCH_SIZE));
  }
  return batches;
}
