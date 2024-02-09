'use strict'

const { AsyncResource } = require('node:async_hooks')
const fastq = require('fastq')

function limit (concurrency = 1) {
  const q = fastq.promise(({ task, args, resource }) => {
    return resource.runInAsyncScope(task, null, ...args)
  }, concurrency)

  return async (task, ...args) => {
    const resource = new AsyncResource('fastp.limit')
    try {
      return await q.push({ task, args, resource })
    } finally {
      resource.emitDestroy()
    }
  }
}

module.exports = limit
