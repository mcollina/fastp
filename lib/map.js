'use strict'

async function map (input, task, opts = {}) {
  let concurrency = opts.concurrency || 1


  const results = []
  let index = 0
  let error
  const toWait = []

  function onError (err) {
    concurrency++
    error = err
  }

  for await (const value of input) {
    if (error) {
      throw error
    }

    // If we have reached the concurrency limit, wait for one of the
    // promises to settle before continuing the loop.
    // The array might include an already resolved promise, so we
    // shift the array until we find a pending promise.
    while (concurrency === 0) {
      await toWait.shift()
    }

    // Copy the index, so that it is not changed by the time the
    // promise resolves.
    const i = index++
    const p = task(value, i)
    concurrency--
    toWait.push(p)
    p.then(function (res) {
      concurrency++
      results[i] = res
    }, onError)
  }
  if (toWait.length > 0) {
    await Promise.all(toWait)
  }
  return results
}

module.exports = map
