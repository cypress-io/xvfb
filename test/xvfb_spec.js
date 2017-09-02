const { expect } = require('chai')

const Xvfb = require('../')

describe('xvfb', function(){
  beforeEach(function(){
    this.xvfb = new Xvfb()
  })

  context('issue: #1', function(){
    it('issue #1: does not mutate process.env.DISPLAY', function(){
      delete process.env.DISPLAY

      expect(process.env.DISPLAY).to.be.undefined

      this.xvfb._setDisplayEnvVariable()
      this.xvfb._restoreDisplayEnvVariable()

      expect(process.env.DISPLAY).to.be.undefined
    })
  })
})
