var url = require('url')

/**
 * get StackTrace for an exception or create one
 * @param exception
 * @return {*}
 */
function stackTrace (exception) {
  if (exception == undefined || exception == null) {
    exception = new Error()
  }
  return exception.stack
}

/**
 * Processes a log record and apply some important information
 * @type TunnelLoggerProcessor
 */
var TunnelLoggerProcessor = {

  configs: null,

    /**
     * Set initial configs from log manager
     * @param configs
     */
  initialize: function (configs) {
    this.configs = configs
  },

    /**
     * Create a log record from params
     * @param level
     * @param message
     * @param code
     * @param exception
     * @return {{channel: string, level: *, message: *, code: *, trace: *}}
     */
  execute: function (level, message, code, exception) {
        // TODO: Converter em uma VO (Value Object)
    var record = {
      channel: this.configs.logName,
      level: level,
      message: message,
      code: code,
      trace: stackTrace(exception)
    }

    return record
  }
}

module.exports = TunnelLoggerProcessor
