var url  = require('url');

function stackTrace(exception) {
    if (exception == undefined || exception == null) {
        exception = new Error();
    }
    return exception.stack;
}

var TunnelLoggerProcessor = {

    configs: null,

    initialize: function (configs) {
        this.configs = configs;
    },

    execute: function (level, message, code, exception) {
        var record = {
            channel: this.configs.logName,
            level: level,
            message: message,
            code: code,
            trace: stackTrace(exception)
        };

        return record;
    },


/*
    httpProcessor: function(request, record) {
        var requestParams = url.parse(request.url);

        record = record || {};

        record.http_host = requestParams.host;
        record.http_hostname = requestParams.hostname;


        return record;
    }*/
};

module.exports = TunnelLoggerProcessor;