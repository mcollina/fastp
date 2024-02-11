'use strict'

const fastq = require('fastq')
const { AsyncResource } = require('node:async_hooks')

function map (input, task, opts = {}) {
  const concurrency = opts.concurrency || 1

  return new Promise(function (_resolve, _reject) { 
    const responses = []
    let index = 0
    const q = fastq(function (i, cb) {
      task(input[i]).then(function (result) {
        responses[i] = result
        if (index < input.length) {
          q.push(index++)
        }
        cb(null)
      }, _reject)
      // do no call the callback
      // in case of error
      // to stop the queue
    }, concurrency)

    q.drain = function () {
      _resolve(responses)
    }

    while (index < concurrency && index < input.length) {
      q.push(index++)
    }
  })
}

module.exports = map
