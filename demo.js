'use strict'

const Xvfb = require('.')
const Promise = require('bluebird')
const xvfb = Promise.promisifyAll(new Xvfb())

xvfb
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
