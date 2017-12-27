'use strict'

const Xvfb = require('.')
const Promise = require('bluebird')

function startStop () {
  const xvfb = Promise.promisifyAll(new Xvfb())
  return xvfb
  .startAsync()
  .catch((err) => {
    console.error('error starting XVFB')
    console.error(err)
    process.exit(1)
  })
  .then((xvfbProcess) => {
    console.log('XVFB started', xvfbProcess.pid)
    return xvfb.stopAsync()
  })
  .then(() => {
    console.log('xvfb stopped')
  })
  .catch((err) => {
    console.error('error stopping XVFB')
    console.error(err)
    process.exit(2)
  })
}

function testNprocs (N = 1) {
  console.log('testing %d procs STARTS NOW', N)
  const procs = []
  for (let k = 0; k < N; k += 1) {
    procs.push(startStop())
  }
  return Promise.all(procs).then(() => {
    console.log('all %d procs done', N)
  })
}

Promise.mapSeries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], () => testNprocs(1)).then(
  () => {
    console.log('all demo procs finished')
  },
  (err) => {
    console.error('err', err)
    process.exit(3)
  }
)
