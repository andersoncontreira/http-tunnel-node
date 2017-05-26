/**
 * Global
 */
Tunnel = require('./modules/Tunnel');
/**
 * Initialization
 */
try {
    Tunnel.initInfo();

    var commander = require('commander');
    var express = require('express');

} catch (error) {
    console.error(Tunnel.consoleFlag + 'Error: ' + error.message);
    console.log(Tunnel.consoleFlag + Tunnel.ERRORS.INTIALIZE.MESSAGE);
    Tunnel.exit(Tunnel.ERRORS.INSTANCE.MODULES_NOT_FOUND);
}

/**
 * Main
 * @type {string}
 */
try {
    /**
     * Parse the command line arguments
     * @see http://localhost:3456/
     */
    Tunnel.init(commander);
    Tunnel.run(express);

} catch (error) {
    /**
     * If crash, restart the tunnel
     */
    Tunnel.restart(express, error);

}

/**
 * Hotfix - TypeError was terminating the process
 */
process.on('uncaughtException', function (error) {
    console.log('uncaughtException');
    /**
     * If crash, restart the tunnel
     */
    try {
        Tunnel.restart(express, error);
    } catch (e) {
        console.log(e.trace);
        //Tunnel.exit(e.message);
    }
    console.log(error);


});

process.on('fatalException', function (error) {
    console.log('fatalException');
    /**
     * If crash, restart the tunnel
     */
    try {
        Tunnel.restart(express, error);
    } catch (e) {
        Tunnel.exit(e.message);
    }

});


process.on('exit', function () {
   console.log('Exiting...');
});