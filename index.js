/* eslint-disable node/no-deprecated-api */
var fs = require('fs')
var path = require('path')
var spawn = require('child_process').spawn
fs.exists = fs.exists || path.exists
fs.existsSync = fs.existsSync || path.existsSync

function Xvfb (options) {
  options = options || {}
  this._display = (options.displayNum ? ':' + options.displayNum : null)
  this._reuse = options.reuse
  this._timeout = options.timeout || 500
  this._silent = options.silent
  this._xvfb_args = options.xvfb_args || []
}

Xvfb.prototype = {
  start: function (cb) {
    if (!this._process) {
      var lockFile = this._lockFile()

      this._setDisplayEnvVariable()

      fs.exists(lockFile, function (exists) {
        var didSpawnFail = false
        try {
          this._spawnProcess(exists, function (e) {
            didSpawnFail = true
            if (cb) cb(e)
          })
        } catch (e) {
          return cb && cb(e)
        }

        var totalTime = 0;
        (function checkIfStarted () {
          fs.exists(lockFile, function (exists) {
            if (didSpawnFail) {
              // When spawn fails, the callback will immediately be called.
              // So we don't have to check whether the lock file exists.
              return
            }
            if (exists) {
              return cb && cb(null, this._process)
            } else {
              totalTime += 10
              if (totalTime > this._timeout) {
                return cb && cb(new Error('Could not start Xvfb.'))
              } else {
                setTimeout(checkIfStarted.bind(this), 10)
              }
            }
          })
        })()
      }.bind(this))
    }
  },

  stop: function (cb) {
    if (this._process) {
      this._killProcess()
      this._restoreDisplayEnvVariable()

      var lockFile = this._lockFile()
      var totalTime = 0;
      (function checkIfStopped () {
        fs.exists(lockFile, function (exists) {
          if (!exists) {
            return cb && cb(null, this._process)
          } else {
            totalTime += 10
            if (totalTime > this._timeout) {
              return cb && cb(new Error('Could not stop Xvfb.'))
            } else {
              setTimeout(checkIfStopped.bind(this), 10)
            }
          }
        })
      })()
    } else {
      return cb && cb(null)
    }
  },

  display: function () {
    if (!this._display) {
      var displayNum = 98
      var lockFile
      do {
        displayNum++
        lockFile = this._lockFile(displayNum)
      } while (!this._reuse && fs.existsSync(lockFile))
      this._display = ':' + displayNum
    }
    return this._display
  },

  _setDisplayEnvVariable: function () {
    this._oldDisplay = process.env.DISPLAY
    process.env.DISPLAY = this.display()
  },

  _restoreDisplayEnvVariable: function () {
    // https://github.com/cypress-io/xvfb/issues/1
    // only reset truthy backed' up values
    if (this._oldDisplay) {
      process.env.DISPLAY = this._oldDisplay
    } else {
      // else delete the values to get back
      // to undefined
      delete process.env.DISPLAY
    }
  },

  _spawnProcess: function (lockFileExists, onAsyncSpawnError) {
    var display = this.display()
    if (lockFileExists) {
      if (!this._reuse) {
        throw new Error('Display ' + display + ' is already in use and the "reuse" option is false.')
      }
    } else {
      this._process = spawn('Xvfb', [ display ].concat(this._xvfb_args))
      this._process.stderr.on('data', function (data) {
        if (!this._silent) {
          process.stderr.write(data)
        }
      }.bind(this))
      // Bind an error listener to prevent an error from crashing node.
      this._process.once('error', function (e) {
        onAsyncSpawnError(e)
      })
    }
  },

  _killProcess: function () {
    this._process.kill()
    this._process = null
  },

  _lockFile: function (displayNum) {
    displayNum = displayNum || this.display().toString().replace(/^:/, '')
    return '/tmp/.X' + displayNum + '-lock'
  }
}

module.exports = Xvfb
