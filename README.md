# tiny-limit

[![npm version](https://img.shields.io/npm/v/tiny-limit.svg)](https://www.npmjs.com/package/tiny-limit)
[![npm downloads](https://img.shields.io/npm/dm/tiny-limit.svg)](https://www.npmjs.com/package/tiny-limit)
[![CI](https://github.com/ofershap/tiny-limit/actions/workflows/ci.yml/badge.svg)](https://github.com/ofershap/tiny-limit/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Run async functions with limited concurrency. Same API as [`p-limit`](https://github.com/sindresorhus/p-limit), but ships both ESM and CJS with zero dependencies.

```ts
import { pLimit } from "tiny-limit";

const limit = pLimit(5);
const results = await Promise.all(urls.map((url) => limit(() => fetch(url))));
```

> 496 bytes gzipped. Zero dependencies.

![Demo](assets/demo.gif)

## Install

```bash
npm install tiny-limit
```

## Usage

```ts
import { pLimit } from "tiny-limit";

const limit = pLimit(3);

const input = [
  limit(() => fetchUser(1)),
  limit(() => fetchUser(2)),
  limit(() => fetchUser(3)),
  limit(() => fetchUser(4)),
  limit(() => fetchUser(5)),
];

const users = await Promise.all(input);
```

### Pass arguments

```ts
const limit = pLimit(2);
const result = await limit(fetch, "https://example.com");
```

### Inspect the queue

```ts
limit.activeCount; // currently running
limit.pendingCount; // waiting in queue
limit.concurrency; // get or set the limit
limit.clearQueue(); // discard pending tasks
```

## Differences from `p-limit`

`p-limit` v4+ is ESM-only. If you `require("p-limit")` in a CommonJS project, you get `ERR_REQUIRE_ESM`. `tiny-limit` works with both `import` and `require()`.

|              | `p-limit`              | `tiny-limit` |
| ------------ | ---------------------- | ------------ |
| CJS support  | v3 only (v4+ ESM-only) | ESM + CJS    |
| Dependencies | `yocto-queue`          | 0            |
| TypeScript   | native (v6+)           | native       |
| Export       | default                | named        |

## Migrating from p-limit

```diff
- import pLimit from "p-limit";
+ import { pLimit } from "tiny-limit";
```

One line. The rest of your code stays the same.

## API

### `pLimit(concurrency: number): LimitFunction`

Returns a `limit` function that queues async work up to the given concurrency. Throws if concurrency is not a positive integer (or `Infinity`).

### `limit(fn, ...args): Promise`

Queues `fn(...args)` and returns a promise.

### `limit.activeCount`

Number of promises currently running.

### `limit.pendingCount`

Number of promises waiting in the queue.

### `limit.concurrency`

Get or set the concurrency limit at runtime.

### `limit.clearQueue()`

Discards all pending tasks.

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
