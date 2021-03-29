const { expect } = require('chai')
const sinon = require('sinon')
const Xvfb = require('../')

describe('xvfb', function () {
  context('onStderrData', function () {
    it('accepts callback function', function () {
      const cb = () => {}

      const xvfb = new Xvfb({
        onStderrData: cb,
      })

      expect(xvfb._onStderrData).to.eq(cb)
    })

    it('sets default function otherwise', function () {
      const xvfb = new Xvfb()

      expect(xvfb._onStderrData).to.be.a('function')
    })
  })

  context('issue: #1', function () {
    beforeEach(function () {
      this.xvfb = new Xvfb()
    })

    it('issue #1: does not mutate process.env.DISPLAY', function () {
      delete process.env.DISPLAY

      expect(process.env.DISPLAY).to.be.undefined

      this.xvfb._setDisplayEnvVariable()
      this.xvfb._restoreDisplayEnvVariable()

      expect(process.env.DISPLAY).to.be.undefined
    })
  })

  context('errors', () => {
    let xvfb
    it('logs error only once', (done) => {
      const stub = sinon.stub()
      .callsFake(() => {
        // first call for initial process start
        // second call for error
        // no third call, since onError should only be called once
        stub.callsFake(() => {
          expect(stub.callCount, 'onError should only call the cb once').eq(2)
          done()
        })
        xvfb._process.emit('close', 999)
        xvfb._process.emit('close', 999)
      })

      xvfb = new Xvfb()
      xvfb.start(stub)
    })
    afterEach(() => {
      xvfb.stop()
    })
  })
})
