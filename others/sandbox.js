var TunnelLogger = require('./modules/TunnelLogger')
var TunnelLoggerProcessor = require('./modules/TunnelLogger/TunnelLoggerProcessor')
var TunnelLoggerLogLevels = require('./modules/TunnelLogger/TunnelLoggerLogLevels')

// TunnelLogger.info('Messagem de erro qualquer', 10);

function myFunction () {
  var url = '/log/tunnel-2017-05-26.log'
  console.log(url)
  var fileName = url.split('/')
  var file = './logs/' + fileName[2]
  console.log(file)
}

myFunction()
