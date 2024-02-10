import p from '../index.js'
import { setTimeout as sleep } from 'node:timers/promises'
const limit = p.limit(2)

const result1 = await Promise.all([
  limit(() => sleep(300, 'foo')),
  limit(() => sleep(200, 'bar')),
  limit(() => sleep(100, 'baz'))
])
console.log(result1)
// [ 'foo', 'bar', 'baz' ]

const result2 = await Promise.race([
  limit(() => sleep(300, 'foo')),
  limit(() => sleep(200, 'bar')),
  limit(() => sleep(100, 'baz'))
])
console.log(result2)
// 'bar'
