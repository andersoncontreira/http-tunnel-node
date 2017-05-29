/**
 * Configs
 */
var packageJson = require('../package.json');

var TunnelConfigs = require('./config/tunnel.configs');
var TunnelErrors = require('./Tunnel/TunnelErrors');
var TunnelMessage = require('./Tunnel/TunnelMessage');
var TunnelLogger = require('./TunnelLogger');

//TODO: FAZER DOWNLOAD DOS LOGS OU ABRIR NO NAVEGADOR

var Tunnel = {
    /**
     * Properties
     */
    name: 'Node Tunnel Socks5',
    description: 'Proxy for Web Service integrations',
    version: packageJson.version,
    consoleFlag: TunnelConfigs.consoleFlag,
    commander: null,
    rebootCount: 0,
    rebootLimit: 30,
    sessionUUID: null,
    /**
     * Messages
     */
    ERRORS: TunnelErrors,

    configs: TunnelConfigs,

    server: null,

    initInfo: function () {
        console.log('+-----------------------------');
        console.log('| ' + this.name);
        console.log('| ' + 'Version: ' + this.version);
        console.log('+-----------------------------');
        console.log(this.consoleFlag + 'Starting...');
    },
    setCommandOptions: function () {
        this.commander
            .option('-s, --socks5-host [value]', 'Socks5 proxy Host (default: 127.0.0.1)')
            .option('-r, --socks5-port [value]', 'Socks5 proxy Port (default: 2222)')
            .option('-t, --http-port [value]', 'Http Port (default: 3456)')
            .option('-x, --use-proxy', 'Uses socks5 proxy (default: true)')
            .option('-d, --debug', 'Active debug mode (default: false)');


    },
    parseCommandArguments: function () {
        this.commander.parse(process.argv);


        this.configs.socks5Host = (this.commander.socks5Host) ? this.commander.socks5Host : this.configs.socks5Host;
        this.configs.socks5Port = (this.commander.socks5Port) ? this.commander.socks5Port : this.configs.socks5Port;
        this.configs.httpPort = (this.commander.httpPort) ? this.commander.httpPort : this.configs.httpPort;
        this.configs.useSocksFive = (this.commander.useProxy) ? true : false;

        if (this.configs.useSocksFive) {
            console.log(this.consoleFlag + 'Using socks5 proxy!');
        } else {
            console.log(this.consoleFlag + 'Not using a socks5 proxy!');
        }

        console.log('--------------------------');
        console.log(this.consoleFlag + 'Configurations:');
        console.log('--------------------------');
        for (var p in this.configs) {
            console.log(this.consoleFlag + p + ': '+ this.configs[p]);
        }
        console.log('--------------------------');
    },
    init: function (commander) {

        if (commander !== null && typeof commander === 'object') {
            commander.version(this.version);
            this.commander = commander;

            this.setCommandOptions();
            this.parseCommandArguments();


        } else {
            throw new Error(Tunnel.ERRORS.INSTANCE.REQUIRED_COMMANDER_MODULE.MESSAGE, Tunnel.ERRORS.INSTANCE.REQUIRED_COMMANDER_MODULE.CODE);
        }
    },
    createSessionUUID: function () {
        var uuid = require('uuid');
        this.sessionUUID = uuid.v4();
    },
    /**
     * Run the Tunnel Process
     * @param express
     */
    run: function (express) {

        this.createSessionUUID();

        console.log(this.consoleFlag + 'Session ID: '+ this.sessionUUID);

        this.createTunnelServerInstance(express);


    },
    /**
     * TunnelErrors properties
     * @param exitObject
     */
    exit: function (exitObject) {

        console.log(this.consoleFlag + 'Exiting...');
        if (exitObject.hasOwnProperty('MESSAGE') && exitObject.hasOwnProperty('CODE')) {
            console.log(this.consoleFlag + 'Message: ' + exitObject.MESSAGE);
            process.exit(exitObject.CODE);
        } else {
            console.log(this.consoleFlag + 'Message: ' + this.ERRORS.INSTANCE.UNKNOWN_ERROR.CODE);
            process.exit(this.ERRORS.INSTANCE.UNKNOWN_ERROR.CODE);
        }

    },
    /**
     * Convert expection to messageObject
     * @param Error e
     * @returns {TunnelMessage}
     */
    parseException: function (e) {
        return new TunnelMessage(e.code, e.message, e);
    },
    /**
     *
     * @param Error e
     */
    treatException: function (e) {
        var tunnelMessage = this.parseException(e);

        this.logException(tunnelMessage)
    },
    /**
     *
     * @param TunnelMessage tunnelMessage
     */
    logException: function(tunnelMessage) {
        console.log(this.consoleFlag + ' +----------------------------------- ');
        console.log(this.consoleFlag + ' | Exception ');
        console.log(this.consoleFlag + ' +----------------------------------- ');

        if (tunnelMessage.hasOwnProperty('CODE') && tunnelMessage.CODE != null) {
            console.log(this.consoleFlag + ' | Code: ' + tunnelMessage.CODE);
        }

        console.log(this.consoleFlag + ' | Message: ' + tunnelMessage.MESSAGE);
        console.log(this.consoleFlag + ' +----------------------------------- ');

        TunnelLogger.error(tunnelMessage.MESSAGE, tunnelMessage.ERROR, tunnelMessage.EXCEPTION);

    },
    closeRequestWithException: function(e) {

        this.treatException(e);
        /**
         * {TunnelRequestMiddleware}
         */
        if (this.server) {
            var middleware = this.server.getBrokeRequest();
            middleware.getErrorPage(middleware.response, e);
        }
    },
    /**
     * Reestart the Tunnel Instance
     * @param express
     * @param error
     */
    restart: function (express, error) {

        /**
         * Increese the counter
         */
        this.rebootCount++;

        /**
         * Log
         */
        console.log(this.consoleFlag + 'Reloading Tunnel...');
        console.log(this.consoleFlag + 'Reload Count: '+ this.rebootCount);

        /**
         * Close the request
         */
        this.closeRequestWithException(error);

        if (this.server) {
            /**
             * Free the port of the server
             */
            this.server.stopListen();
        }

        /**
         * Destroy the internal server instance
         */
        this.killTunnelServerInstance();

        /**
         * Control the reboot action
         */
        if (this.rebootCount < this.rebootLimit) {
            /**
             * Run again
             */
            this.run(express);
        } else {
            this.exit(this.parseException(error));
        }

    },
    /**
     * Destroy the internal server instance
     */
    killTunnelServerInstance: function() {
        this.server = null;
    },
    /**
     * Create a TunnelServer and apply to this.server
     * @param express
     */
    createTunnelServerInstance: function (express) {
        /**
         * Because the requires, cant be in head of script
         */
        var TunnelServer = require('./TunnelServer');

        this.server = TunnelServer;
        this.server.init(express);
        this.server.run();


    }
};

module.exports = Tunnel;
