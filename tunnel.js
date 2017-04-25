var Tunnel = require('./modules/Tunnel');

/**
 * Initialization
 */
try{
    Tunnel.initInfo();

    var commander = require('commander');
    var express = require('express');

} catch (e) {
    console.error(Tunnel.consoleFlag + 'Error: '+ e.message);
    console.log(Tunnel.consoleFlag + Tunnel.ERRORS.INTIALIZE.MESSAGE);
    Tunnel.exit(Tunnel.ERRORS.INSTANCE.MODULES_NOT_FOUND);

}
/**
 * Main
 * @type {string}
 */
try {

    Tunnel.init(commander);
    Tunnel.run(express);

} catch (e) {
    Tunnel.exit(Tunnel.parseException(e));
}