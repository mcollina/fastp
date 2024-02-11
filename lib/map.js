'use strict'

const fastq = require('fastq')
const { AsyncResource } = require('node:async_hooks')

function map (input, task, opts = {}) {
  const concurrency = opts.concurrency || 1

  const iterator = input[Symbol.iterator]()

  return new Promise(function (_resolve, _reject) { 
    let index = 0
    const responses = []

    function next () {
      const { value, done } = iterator.next()
      if (done) {
        return false
      }
      q.push({ value, i: index++ })
      return true
    }

    const q = fastq(function ({ value, i }, cb) {
      task(value, i).then(function (result) {
        responses[i] = result
        next()
        cb(null)
      }, _reject)
      // do no call the callback
      // in case of error
      // to stop the queue
    }, concurrency)

    q.drain = function () {
      _resolve(responses)
    }

    while (index < concurrency && next()) {}
  })
}

module.exports = map
