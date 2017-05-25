var TunnelLoggerConfigs = require('./config/TunnelLoggerConfigs');
var TunnelLoggerManager = require('./TunnelLogger/TunnelLoggerManager');

function TunnelLogger(TunnelLoggerConfigs) {

    this.logManager = TunnelLoggerManager;

    var logName = TunnelLoggerConfigs.logName;
    /**
     * moment js
     */
    // var dateStr = moment.format(TunnelLoggerConfigs.logDateFormat);
    // var fileName = logName + dateStr;


    this.logFileName = '/logs/tunnel.log';

    this.error = function (msg) {

    };
    this.info = function (msg) {

    };
    this.warning = function (msg) {

    };


}

module.exports = new TunnelLogger(TunnelLoggerConfigs);