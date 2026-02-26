# tiny-limit

[![npm version](https://img.shields.io/npm/v/tiny-limit.svg)](https://www.npmjs.com/package/tiny-limit)
[![npm downloads](https://img.shields.io/npm/dm/tiny-limit.svg)](https://www.npmjs.com/package/tiny-limit)
[![CI](https://github.com/ofershap/tiny-limit/actions/workflows/ci.yml/badge.svg)](https://github.com/ofershap/tiny-limit/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle size](https://img.shields.io/badge/gzip-496_B-brightgreen)](https://github.com/ofershap/tiny-limit)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://github.com/ofershap/tiny-limit)

Drop-in replacement for [`p-limit`](https://github.com/sindresorhus/p-limit) that works in both ESM and CommonJS.

```ts
import { pLimit } from "tiny-limit";

const limit = pLimit(5);
const results = await Promise.all(urls.map((url) => limit(() => fetch(url))));
```

> Zero dependencies. 496 bytes gzipped. ESM + CJS dual export — no more pinning to p-limit v3.

![Demo](assets/demo.gif)

## Why tiny-limit?

[`p-limit`](https://github.com/sindresorhus/p-limit) has 148M weekly downloads but went ESM-only in v4, breaking thousands of CommonJS projects ([#57](https://github.com/sindresorhus/p-limit/issues/57), [#63](https://github.com/sindresorhus/p-limit/issues/63), [#69](https://github.com/sindresorhus/p-limit/issues/69)). It also pulls in `yocto-queue` as a dependency. `tiny-limit` ships ESM + CJS with zero dependencies.

|              | `p-limit`              | `tiny-limit` |
| ------------ | ---------------------- | ------------ |
| CJS support  | v3 only (v4+ ESM-only) | ESM + CJS    |
| Dependencies | `yocto-queue`          | 0            |
| TypeScript   | native (v6+)           | native       |
| API          | default export         | named export |
| Size (gzip)  | 596B + yocto-queue     | 496B         |

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

## API

### `pLimit(concurrency: number): LimitFunction`

Returns a `limit` function that queues async work up to the given concurrency. Throws `TypeError` if concurrency is not a positive integer (or `Infinity`).

### `limit(fn, ...args): Promise`

Queues `fn(...args)` and returns a promise that resolves/rejects with the function's result.

### `limit.activeCount: number`

Number of promises currently running.

### `limit.pendingCount: number`

Number of promises waiting in the queue.

### `limit.concurrency: number`

Get or set the concurrency limit at runtime.

### `limit.clearQueue(): void`

Discards all pending (not yet started) tasks.

## Migrating from p-limit

```diff
- import pLimit from "p-limit";
+ import { pLimit } from "tiny-limit";
```

One line. The API is compatible.

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
