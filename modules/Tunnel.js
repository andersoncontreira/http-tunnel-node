var TunnelConfigs = require('./config/tunnel.configs');
var TunnelErrors = require('./Tunnel/TunnelErrors');
var TunnelMessage = require('./Tunnel/TunnelMessage');


var Tunnel = {
    /**
     * Properties
     */
    name: 'Node Tunnel Socks5',
    version: '1.0.5',
    consoleFlag: TunnelConfigs.consoleFlag,
    commander: null,
    /**
     * Messages
     */
    ERRORS: TunnelErrors,

    configs: TunnelConfigs,

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
    run: function (express) {

        var TunnelServer = require('./TunnelServer');
        TunnelServer.init(express);
        TunnelServer.run();

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
     * @param e
     * @returns {TunnelMessage}
     */
    parseException: function (e) {
        return new TunnelMessage(e.code, e.message);
    }
};

module.exports = Tunnel;
