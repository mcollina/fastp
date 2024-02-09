'use strict'

const { test, describe } = require('node:test')
const { AsyncLocalStorage } = require('node:async_hooks')
const assert = require('assert')
const { setTimeout: sleep } = require('timers/promises')
const fastp = require('../')

describe('limit', () => {
  test('should limit the number of parallel promises', async () => {
    const input = [1, 2, 3, 4, 5]
    const expected = [1, 2, 3, 4, 5]
    const inflight = new Set()
    const actual = []
    const limit = fastp.limit(2)
    await Promise.all(input.map(i => {
      return limit(async () => {
        assert.strictEqual(inflight.size <= 2, true)
        inflight.add(i)
        await sleep(1)
        inflight.delete(i)
        actual.push(i)
      })
    }))
    assert.deepStrictEqual(actual, expected)
  })

  test('should pass arguments to the task', async () => {
    const input = [1, 2, 3, 4, 5]
    const expected = [1, 2, 3, 4, 5]
    const actual = []
    const limit = fastp.limit(2)
    await Promise.all(input.map(i => {
      return limit(async (j) => {
        actual.push(j)
      }, i)
    }))
    assert.deepStrictEqual(actual, expected)
  })

  test('should return the value', async () => {
    const input = [1, 2, 3, 4, 5]
    const expected = [1, 2, 3, 4, 5]
    const limit = fastp.limit(2)
    const res = await Promise.all(input.map(i => limit(fn, i)))

    async function fn (j) {
      return j
    }
    assert.deepStrictEqual(res, expected)
  })

  test('should propagate async context', async () => {
    const input = [1, 2, 3, 4, 5]
    const limit = fastp.limit(2)
    const storage = new AsyncLocalStorage()
    await Promise.all(input.map(i => {
      return storage.run({ i }, async () => {
        return limit(async (j) => {
          assert.deepStrictEqual(storage.getStore(), { i })
        }, i)
      })
    }))
  })

  test('should reject with errors', async () => {
    const input = [1, 2, 3, 4, 5]
    const limit = fastp.limit(2)
    const expected = new Error('boom')
    const actual = []
    try {
      await Promise.all(input.map(i => {
        return limit(async () => {
          if (i === 3) {
            throw expected
          }
          actual.push(i)
        })
      }))
    } catch (err) {
      assert.strictEqual(err, expected)
    }
    assert.deepStrictEqual(actual, [1, 2, 4, 5])
  })
})
