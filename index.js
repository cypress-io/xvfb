var path = require('path');
var spawn = require('child_process').spawn;
var usleep = require('sleep').usleep;

function _lockFileForDisplay (display) {
  displayNum = display.toString().replace(/^:/, '');
  return '/tmp/.X' + displayNum + '-lock';
};

function Xvfb(options) {
  options = options || {};
  this._display = (options.displayNum ? ':' + options.displayNum : null);
  this._reuse = options.reuse;
}

Xvfb.prototype = {
  start: function() {
    if (this._process) {
      return;
    }

    var display = this.display();
    var lockFile = _lockFileForDisplay(display);
    this._oldDisplay = process.env.DISPLAY;
    process.env.DISPLAY = display;

    if (path.existsSync(lockFile)) {
      if (this._reuse) {
        return;
      } else {
        throw new Error('Display ' + display + ' is already in use and the "reuse" option is false.');
      }
    }

    this._process = spawn('Xvfb', [ display ]);

    var sleepMs = 10;
    var timeoutMs = 500;
    while (!path.existsSync(lockFile)) {
      if (timeoutMs <= 0) {
        throw new Error('could not start Xvfb');
      }
      usleep(sleepMs * 1000);
      timeoutMs -= sleepMs;
    }
  },

  stop: function() {
    if (this._process) {
      this._process.kill();
      this._process = null;
    }
    process.env.DISPLAY = this._oldDisplay;
  },


  display: function() {
    if (!this._display) {
      var displayNum = 98;
      var lockFile;
      do {
        displayNum++;
        lockFile = _lockFileForDisplay(displayNum);
      } while (!this._reuse && path.existsSync(lockFile));
      this._display = ':' + displayNum;
    }
    return this._display;
  }
}

module.exports = Xvfb;

