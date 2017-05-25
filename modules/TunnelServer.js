var TunnelErrors = require('./Tunnel/TunnelErrors');
var Tunnel = require("./Tunnel.js");

/**
 * Initialization
 */
try{

    var bodyParser = require('body-parser');
    var favicon = require('serve-favicon');
    var path = require('path');
    var http = require('http');
    var url = require('url');


} catch (error) {
    console.error(Tunnel.consoleFlag + 'Error: '+ error.message);
    console.log(Tunnel.consoleFlag + Tunnel.ERRORS.INTIALIZE.MESSAGE);
    Tunnel.exit(Tunnel.ERRORS.SERVER.MODULES_NOT_FOUND);

}

var TunnelServer = {
    express: null,
    app: null,
    server: null,
    /**
     * Initialize the TunnelServer
     * @param express
     */
    init: function (express) {

        if (express != null && typeof express === 'function') {
            this.express = express;
        } else {
            throw new Error(TunnelErrors.SERVER.REQUIRED_EXPRESS_MODULE.MESSAGE, TunnelErrors.SERVER.REQUIRED_EXPRESS_MODULE.CODE);
        }

    },
    initializeExpress: function () {
        var app = this.express();
        //Favicon
        app.use(favicon(path.join(__dirname, '../public', 'favicon.jpg')));
        //JSON
        app.use(bodyParser.json());
        // FORM-DATA
        app.use(bodyParser.urlencoded({extended: false}));
        //Read XML request as Text
        app.use(bodyParser.text({type: ['*/xml', '+xml']}));

        this.app = app;
    },
    routes: function () {
        var TunnelServerRoutes = require("./TunnelServer/TunnelServerRoutes");
        TunnelServerRoutes.applyRoutes(this.app);
    },
    run: function () {

        this.initializeExpress();
        this.routes();
        this.listen();

    },
    /**
     *
     */
    listen: function () {

        this.server = this.app.listen(Tunnel.configs.httpPort, function () {
            console.log(Tunnel.consoleFlag + 'Server running at port:' + Tunnel.configs.httpPort);
        });

    },
    /**
     *
     */
    stopListen: function () {
        this.server.close();
    },

    getBrokeRequest: function () {
        var TunnelServerRoutes = require("./TunnelServer/TunnelServerRoutes");
        return TunnelServerRoutes.getRequestMiddleware();
    }
};

module.exports = TunnelServer;