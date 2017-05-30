/**
 * Verify if the dependencies are installed.
 */
try {
    /**
     * Global
     */
    TunnelConfigs = require('./modules/config/TunnelConfigs');
    TunnelErrors = require('./modules/Tunnel/TunnelErrors');
    TunnelLogger = require('./modules/TunnelLogger');
    Tunnel = require('./modules/Tunnel');

    /**
     * Main libraries
     */
    var commander = require('commander');
    var express = require('express');

    Tunnel.initInfo();

} catch (error) {
     console.error(TunnelConfigs.consoleFlag + 'Error: ' + error.message);
     console.error(TunnelConfigs.consoleFlag + TunnelErrors.INTIALIZE.MESSAGE);
     process.exit(TunnelConfigs.consoleFlag + TunnelErrors.INSTANCE.MODULES_NOT_FOUND);
}

/**
 * This method restart the application
 * @param Error error
 */
function tunnelRestart(error) {
    /**
     * If crash, restart the tunnel
     */
    try {
        Tunnel.restart(express, error);
    } catch (e) {
        Tunnel.exit(e.message);
    }
}

/**
 * Main - Start the application
 */
try {
    /**
     * Parse the command line arguments
     * @see http://localhost:3456/
     */
    Tunnel.init(commander);
    Tunnel.run(express);
} catch (error) {
    tunnelRestart(error);
}

/**
 * Try to restart the application
 */
process.on('uncaughtException', function (error) {
    tunnelRestart(error);
});
/**
 * Try to restart the application
 */
process.on('fatalException', function(error){
    tunnelRestart(error);
});
