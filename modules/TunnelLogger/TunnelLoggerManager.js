var winston = require('winston');
var TunnelLoggerConfigs = require('../config/TunnelLoggerConfigs');
var TunnelLoggerProcessor = require('../TunnelLogger/TunnelLoggerProcessor');
var moment = require('moment');

function BuildLogger(configs) {
    this.configs = this.overrideConfigs(configs);
}

BuildLogger.prototype.overrideConfigs = function(configs) {
    var defaultConfigs = TunnelLoggerConfigs;

    for (var index in configs) {
        if (defaultConfigs.hasOwnProperty(index)) {
            defaultConfigs[index] = configs[index];
        }
    }

    if(defaultConfigs.hasOwnProperty('logNameDate')) {
        defaultConfigs['logNameDate'] = moment().format(defaultConfigs['logNameDate']);
    }

    var logFileName = defaultConfigs['logFileName'];
    var variables = logFileName.match(/{{\w+}}/g);

    if (Array.isArray(variables)) {
        for(var index in variables) {
            var propName = variables[index];

            var nameSeparator = propName.replace(/{{|}}/g, '');

            if(defaultConfigs.hasOwnProperty(nameSeparator)){
                logFileName = logFileName.replace(propName, defaultConfigs[nameSeparator]);
            }
        }
    }

    defaultConfigs['logFileName'] = logFileName;

    return defaultConfigs;
};

/**
 *
 * @returns EventEmitter
 */
BuildLogger.prototype.getLogger = function () {

    var filePath = process.cwd() + this.configs.filePath + this.configs.logFileName;

    return new(winston.Logger)({
        transports: [
            new (winston.transports.File)({
                name: this.configs.logName,
                filename: filePath,
                level: this.configs.logLevel,
                logstash: true
            })
        ]
    });
};



var TunnelLoggerManager = {
    /** @var EventEmitter */
    logger: null,
    configs: null,

    initialize: function (configs) {
        if (this.logger == null) {
            var buildLogger = new BuildLogger(configs);
            this.logger = buildLogger.getLogger();
            this.configs = buildLogger.configs;
        }
        return this;
    },
    /**
     *
     * @param level
     * @param message
     * @param code
     * @param Error exception
     */
    writeLog: function(level, message, code, exception) {

        TunnelLoggerProcessor.initialize(this.configs);
        var record = TunnelLoggerProcessor.execute(level, message, code, exception);

        this.logger.log(level, record);
    }
};





module.exports = TunnelLoggerManager;