/**
 * Errors enumerator
 * @type TunnelErrors
 */
var TunnelErrors = {
    INTIALIZE: {
        CODE: 99,
        MESSAGE: 'Execute the "npm install" command!'
    },
    INSTANCE: {
        UNKNOWN_ERROR:{
            CODE:0,
            MESSAGE: 'Error not specified!'
        },
        MODULES_NOT_FOUND: {
            CODE: 1,
            MESSAGE: 'Modules not found!'
        },
        REQUIRED_COMMANDER_MODULE: {
            CODE: 2,
            MESSAGE: 'Commander module is required!'
        }
    },
    SERVER: {
        UNKNOWN_ERROR:{
            CODE:0,
            MESSAGE: 'Error not specified!'
        },
        MODULES_NOT_FOUND: {
            CODE: 1,
            MESSAGE: 'Modules not found!'
        },
        REQUIRED_EXPRESS_MODULE: {
            CODE: 11,
            MESSAGE: 'Express module is required!'
        },
        RESPONSE_BODY_UNDEFINED: {
            CODE: 13,
            MESSAGE: 'Request body undefined!'
        }
    }

};

module.exports = TunnelErrors;