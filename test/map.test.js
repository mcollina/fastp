'use strict'

const { test, describe } = require('node:test')
const { AsyncLocalStorage } = require('node:async_hooks')
const assert = require('assert')
const { setTimeout: sleep } = require('timers/promises')
const p = require('../')

describe('map', () => {
  test('should map the input', async () => {
    const input = [1, 2, 3, 4, 5]
    const expected = [1, 4, 9, 16, 25]
    const actual = await p.map(input, async (i) => {
      await sleep(1)
      return i * i
    })
    assert.deepStrictEqual(actual, expected)
  })

  test('should map the input with concurrency', async () => {
    const input = [1, 2, 3, 4, 5]
    const expected = [1, 4, 9, 16, 25]
    const inflight = new Set()
    const actual = await p.map(input, async (i) => {
      assert.strictEqual(inflight.size <= 2, true)
      inflight.add(i)
      await sleep(1)
      inflight.delete(i)
      return i * i
    }, { concurrency: 2 })
    assert.deepStrictEqual(actual, expected)
  })

  test('should propagate async context', async () => {
    const input = [1, 2, 3, 4, 5]
    const storage = new AsyncLocalStorage()
    const actual = await p.map(input, (i) => {
      return storage.run({ i }, async () => {
        return storage.getStore().i
      })
    })
    assert.deepStrictEqual(actual, input)
  })

  test('should stop processing on error', async () => {
    const input = [1, 2, 3, 4, 5]
    const expected = [1, 2]
    const actual = []
    await p.map(input, async (i) => {
      if (i === 3) throw new Error('stop')
      actual.push(i)
      await sleep(1)
      return i * i
    }).catch((err) => {
      assert.strictEqual(err.message, 'stop')
    })
    assert.deepStrictEqual(actual, expected)
  })

  test('should support async iterators', async () => {
    const input = (async function * () {
      for (let i = 1; i <= 5; i++) {
        yield i
      }
    })()
    const expected = [1, 4, 9, 16, 25]
    const actual = await p.map(input, async (i) => {
      await sleep(1)
      return i * i
    })
    assert.deepStrictEqual(actual, expected)
  })

  test('should map the input as an iterator', async () => {
    const input = (function * () {
      for (let i = 1; i <= 5; i++) {
        yield i
      }
    })()
    const expected = [1, 4, 9, 16, 25]
    const actual = await p.map(input, async (i) => {
      await sleep(1)
      return i * i
    })
    assert.deepStrictEqual(actual, expected)
  })

  test('concurrency must be at least 1', async () => {
    const input = [1, 2, 3, 4, 5]
    await assert.rejects(async () => {
      await p.map(input, async (i) => {
        await sleep(1)
        return i * i
      }, { concurrency: 0 })
    }, new Error('concurrency must be at least 1'))
  })
})
