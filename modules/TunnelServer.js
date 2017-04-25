var TunnelErrors = require('./Tunnel/TunnelErrors');
var Tunnel = require('./Tunnel');

/**
 * Initialization
 */
try{

    var bodyParser = require('body-parser');
    var favicon = require('serve-favicon');
    var path = require('path');
    var http = require('http');
    var url = require('url');


} catch (e) {
    console.error(Tunnel.consoleFlag + 'Error: '+ e.message);
    console.log(Tunnel.consoleFlag + Tunnel.ERRORS.INTIALIZE.MESSAGE);
    Tunnel.exit(Tunnel.ERRORS.SERVER.MODULES_NOT_FOUND);

}

var TunnelServer = {
    express: null,
    app: null,
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

        this.app.listen(Tunnel.configs.httpPort, this.listen);
    },
    listen: function () {
        console.log(Tunnel.consoleFlag + 'Server running at port:' + Tunnel.configs.httpPort);
    }
};

module.exports = TunnelServer;