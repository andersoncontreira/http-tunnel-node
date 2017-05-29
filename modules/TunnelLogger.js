var TunnelLoggerLogLevels = require('./TunnelLogger/TunnelLoggerLogLevels');
var TunnelLoggerManager = require('./TunnelLogger/TunnelLoggerManager');
var fs = require('fs');

var TunnelLogger = {
    logManager: TunnelLoggerManager.initialize(),

    logs: readLogFiles(),

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

function readLogFiles() {
    var path = './logs/';
    var files = [];

    var items = fs.readdirSync(path);

    items.forEach(function(item) {
        files.push({'log' : item});
    });

    return files;
}

module.exports = TunnelLogger;