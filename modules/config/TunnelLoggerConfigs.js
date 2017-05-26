var TunnelLoggerLogLevels = require('../TunnelLogger/TunnelLoggerLogLevels');
var TunnelLoggerConfigs = {
   logName: 'tunnel',
   logNameDate: 'Y-MM-D',
   logDateFormat: 'Y-MM-D HH:mm:ss',
   logFileName: '{{logName}}-{{logNameDate}}.log',
   filePath: '/logs/',
   logLevel: TunnelLoggerLogLevels.INFO.NAME
};

module.exports = TunnelLoggerConfigs;


