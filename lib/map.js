'use strict'

async function map (input, task, opts = {}) {
  let concurrency = opts.concurrency || 1

  const results = []
  let index = 0
  let error
  const toWait = new Set()
  for await (const value of input) {
    if (error) {
      throw error
    }
    const i = index++
    const p = task(value, i)
    if (concurrency === 1) {
      results[i] = await p
    } else {
      toWait.add(p)
      concurrency--
      p.then(res => {
        toWait.delete(p)
        concurrency++
        results[i] = res
      }, err => {
        toWait.delete(p)
        concurrency++
        error = err
      })
    }
  }
  if (toWait.size) {
    await Promise.all(toWait)
  }
  return results
}

module.exports = map
