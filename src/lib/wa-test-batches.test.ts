import { describe, expect, it } from "vitest";
import { chunkWaTestUserIds, WA_TEST_BATCH_SIZE } from "./wa-test-batches";

describe("chunkWaTestUserIds", () => {
  it("splits recipients into small batches and keeps their order", () => {
    const userIds = Array.from({ length: WA_TEST_BATCH_SIZE + 1 }, (_, i) => `user-${i}`);

    expect(chunkWaTestUserIds(userIds)).toEqual([
      userIds.slice(0, WA_TEST_BATCH_SIZE),
      userIds.slice(WA_TEST_BATCH_SIZE),
    ]);
  });

  it("returns no batches when there are no recipients", () => {
    expect(chunkWaTestUserIds([])).toEqual([]);
  });
});
