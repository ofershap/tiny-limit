export interface LimitFunction {
  <Arguments extends unknown[], ReturnType>(
    fn: (...args: Arguments) => PromiseLike<ReturnType> | ReturnType,
    ...args: Arguments
  ): Promise<ReturnType>;
  readonly activeCount: number;
  readonly pendingCount: number;
  clearQueue: () => void;
  concurrency: number;
}

interface QueueNode {
  run: () => void;
  next?: QueueNode;
}

export function pLimit(concurrency: number): LimitFunction {
  validateConcurrency(concurrency);

  let head: QueueNode | undefined;
  let tail: QueueNode | undefined;
  let size = 0;
  let activeCount = 0;

  const enqueue = (run: () => void): void => {
    const node: QueueNode = { run };
    if (tail) {
      tail.next = node;
      tail = node;
    } else {
      head = tail = node;
    }
    size++;
  };

  const dequeue = (): (() => void) | undefined => {
    if (!head) return undefined;
    const { run } = head;
    head = head.next;
    if (!head) tail = undefined;
    size--;
    return run;
  };

  const resumeNext = (): void => {
    if (activeCount < concurrency && size > 0) {
      activeCount++;
      const run = dequeue();
      if (run) run();
    }
  };

  const next = (): void => {
    activeCount--;
    resumeNext();
  };

  const generator = (
    fn: (...args: unknown[]) => unknown,
    ...args: unknown[]
  ): Promise<unknown> =>
    new Promise((resolve) => {
      enqueue(() => {
        const result = (async () => fn(...args))();
        resolve(result);
        result.then(next, next);
      });
      resumeNext();
    });

  Object.defineProperties(generator, {
    activeCount: { get: () => activeCount },
    pendingCount: { get: () => size },
    clearQueue: {
      value() {
        head = tail = undefined;
        size = 0;
      },
    },
    concurrency: {
      get: () => concurrency,
      set(value: number) {
        validateConcurrency(value);
        concurrency = value;
        Promise.resolve().then(() => {
          while (activeCount < concurrency && size > 0) {
            resumeNext();
          }
        });
      },
    },
  });

  return generator as LimitFunction;
}

function validateConcurrency(value: number): void {
  if (
    !(
      (Number.isInteger(value) || value === Number.POSITIVE_INFINITY) &&
      value > 0
    )
  ) {
    throw new TypeError("Expected `concurrency` to be a number from 1 and up");
  }
}
