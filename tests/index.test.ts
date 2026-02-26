import { describe, it, expect } from "vitest";
import { pLimit } from "../src/index.js";

describe("pLimit", () => {
  it("limits concurrency to 1", async () => {
    const limit = pLimit(1);
    const order: number[] = [];

    const delay = (ms: number, id: number) =>
      new Promise<number>((resolve) =>
        setTimeout(() => {
          order.push(id);
          resolve(id);
        }, ms),
      );

    const results = await Promise.all([
      limit(() => delay(50, 1)),
      limit(() => delay(10, 2)),
      limit(() => delay(10, 3)),
    ]);

    expect(results).toEqual([1, 2, 3]);
    expect(order).toEqual([1, 2, 3]);
  });

  it("allows higher concurrency", async () => {
    const limit = pLimit(2);
    let running = 0;
    let maxRunning = 0;

    const task = () =>
      new Promise<void>((resolve) => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        setTimeout(() => {
          running--;
          resolve();
        }, 30);
      });

    await Promise.all(Array.from({ length: 6 }, () => limit(task)));

    expect(maxRunning).toBe(2);
  });

  it("returns the function result", async () => {
    const limit = pLimit(1);
    const result = await limit(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it("propagates errors", async () => {
    const limit = pLimit(1);
    await expect(
      limit(() => Promise.reject(new Error("fail"))),
    ).rejects.toThrow("fail");
  });

  it("passes arguments through", async () => {
    const limit = pLimit(1);
    const fn = (a: number, b: number) => Promise.resolve(a + b);
    const result = await limit(fn, 3, 4);
    expect(result).toBe(7);
  });

  it("exposes activeCount and pendingCount", async () => {
    const limit = pLimit(1);
    expect(limit.activeCount).toBe(0);
    expect(limit.pendingCount).toBe(0);

    const p1 = limit(
      () => new Promise<void>((resolve) => setTimeout(resolve, 50)),
    );
    const p2 = limit(
      () => new Promise<void>((resolve) => setTimeout(resolve, 50)),
    );

    expect(limit.activeCount).toBe(1);
    expect(limit.pendingCount).toBe(1);

    await Promise.all([p1, p2]);

    expect(limit.activeCount).toBe(0);
    expect(limit.pendingCount).toBe(0);
  });

  it("clearQueue discards pending tasks", async () => {
    const limit = pLimit(1);
    const results: number[] = [];

    const slow = () =>
      new Promise<void>((resolve) =>
        setTimeout(() => {
          results.push(1);
          resolve();
        }, 50),
      );

    const fast = () =>
      new Promise<void>((resolve) => {
        results.push(2);
        resolve();
      });

    const p1 = limit(slow);
    limit(fast);

    expect(limit.pendingCount).toBe(1);
    limit.clearQueue();
    expect(limit.pendingCount).toBe(0);

    await p1;
    expect(results).toEqual([1]);
  });

  it("exposes and allows setting concurrency", () => {
    const limit = pLimit(3);
    expect(limit.concurrency).toBe(3);
    limit.concurrency = 5;
    expect(limit.concurrency).toBe(5);
  });

  it("throws on invalid concurrency", () => {
    expect(() => pLimit(0)).toThrow(TypeError);
    expect(() => pLimit(-1)).toThrow(TypeError);
    expect(() => pLimit(1.5)).toThrow(TypeError);
  });

  it("accepts Infinity as concurrency", () => {
    const limit = pLimit(Infinity);
    expect(limit.concurrency).toBe(Infinity);
  });

  it("handles synchronous functions", async () => {
    const limit = pLimit(1);
    const result = await limit(() => 42);
    expect(result).toBe(42);
  });

  it("handles errors without blocking the queue", async () => {
    const limit = pLimit(1);
    const errors: string[] = [];
    const successes: string[] = [];

    const p1 = limit(() => Promise.reject(new Error("oops"))).catch(() => {
      errors.push("error");
    });
    const p2 = limit(() => {
      successes.push("ok");
      return Promise.resolve();
    });

    await Promise.all([p1, p2]);
    expect(errors).toEqual(["error"]);
    expect(successes).toEqual(["ok"]);
  });
});
