import cronometro from 'cronometro'
import pLimit from 'p-limit'
import p from '../index.js'
import { setImmediate as immediate } from 'timers/promises'

cronometro({
  pLimit: async function () {
    const limit = pLimit(1)

    const input = [
      limit(immediate),
      limit(immediate),
      limit(immediate)
    ]

    await Promise.all(input)
  },
  'fastp.limit': async function () {
    const limit = p.limit(1)

    const input = [
      limit(immediate),
      limit(immediate),
      limit(immediate)
    ]

    await Promise.all(input)
  }
})
