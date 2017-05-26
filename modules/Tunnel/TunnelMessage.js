/**o
 *
 * @param code
 * @param message
 * @param Error exception
 * @constructor
 */
function TunnelMessage(code, message, exception){
    this.CODE = code;
    this.MESSAGE = message;
    this.EXCEPTION = exception;
}

module.exports = TunnelMessage;
