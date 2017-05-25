var TunnelLogger = require('./modules/TunnelLogger');

TunnelLogger.error('some error');
TunnelLogger.info('some info');
TunnelLogger.warning('some warning');

console.log(TunnelLogger);
