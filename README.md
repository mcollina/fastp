# fastp

Fast promise utilities.

## Install

```js
npm i @matteo.collina/p
```

## API

### `p.limit(concurrency=1)`

Limit the number of promises resolved concurrently.
Offers the same API of [p-limit](http://npm.im/p-limit)

```js
import p from '@matteo.collina/p'
import { settimeout as sleep } from 'node:timers/promises'
const limit = p.limit(2);

const result1 = await Promise.all([
	limit(() => sleep(300, 'foo')),
	limit(() => sleep(200, 'bar')),
	limit(() => sleep(100, 'baz'))
]);
console.log(result1)
// [ 'foo', 'bar', 'baz' ]

const result2 = await Promise.race([
	limit(() => sleep(300, 'foo')),
	limit(() => sleep(200, 'bar')),
	limit(() => sleep(100, 'baz'))
]);
console.log(result2)
// 'bar'
```

It's over 3x faster than `p-limit`  

```
╔══════════════╤═════════╤═════════════════╤═══════════╗
║ Slower tests │ Samples │          Result │ Tolerance ║
╟──────────────┼─────────┼─────────────────┼───────────╢
║ pLimit       │   10000 │ 24994.77 op/sec │  ± 3.08 % ║
╟──────────────┼─────────┼─────────────────┼───────────╢
║ Fastest test │ Samples │          Result │ Tolerance ║
╟──────────────┼─────────┼─────────────────┼───────────╢
║ fastp.limit  │   10000 │ 91958.28 op/sec │  ± 5.76 % ║
╚══════════════╧═════════╧═════════════════╧═══════════╝
```

## License

MIT
