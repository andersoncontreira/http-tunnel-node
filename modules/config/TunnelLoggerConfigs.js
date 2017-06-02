var TunnelLoggerLogLevels = require('../TunnelLogger/TunnelLoggerLogLevels');

/**
 *  Default configs for TunnelLogger
 *  @type TunnelLoggerConfigs
 */
var TunnelLoggerConfigs = {
   logName: 'tunnel',
   logNameDate: 'Y-MM-D',
   logDateFormat: 'Y-MM-D HH:mm:ss',
   logFileName: '{{logName}}-{{logNameDate}}.log',
   filePath: '/logs/',
   logLevel: TunnelLoggerLogLevels.INFO
};

module.exports = TunnelLoggerConfigs;


