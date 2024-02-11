import cronometro from 'cronometro'
import pMap from 'p-map'
import { map } from '../index.js'
import { setImmediate as immediate } from 'timers/promises'

const array = []

for (let i = 0; i < 100; i++) {
  array.push(i)
}

async function mapper (input) {
  await immediate()
  return input * 2
}

cronometro({
  pMap: async function () {
    await pMap(array, mapper, { concurrency: 2 })
  },
  'p.map': async function () {
    await map(array, mapper, { concurrency: 2 })
  }
}, { iterations: 10000, errorThreshold: 0 })
