var TunnelLoggerLogLevels = require('./TunnelLogger/TunnelLoggerLogLevels');
var TunnelLoggerManager = require('./TunnelLogger/TunnelLoggerManager');

var TunnelLogger = {
    logManager: TunnelLoggerManager.initialize(),

    info: function (message) {
        this.logManager.writeLog(TunnelLoggerLogLevels.INFO, message);
    },
    error: function (message, code, exception) {
        this.logManager.writeLog(TunnelLoggerLogLevels.ERROR, message, code, exception);
    },
    warn: function (message, code) {
        this.logManager.writeLog(TunnelLoggerLogLevels.WARNING, message, code ,exception);
    }
};

module.exports = TunnelLogger;