const Xvfb = require('.')

let xvfb = new Xvfb()
xvfb.start(function (err, xvfbProcess) {
  if (err) {
    console.error('error starting XVFB')
    console.error(err)
    process.exit(1)
  }

  console.log('XVFB started')
  console.log(Object.keys(xvfbProcess))

  xvfb.stop(function (err) {
    if (err) {
      console.error('error stopping XVFB')
      console.error(err)
      process.exit(2)
    }
  })
})
