var TunnelRequestMiddleware = require("./TunnelRequestMiddleware");

var fs = require('fs');
var path = require('path');
var mustache = require('mustache');

/**
 * Class TunnelServerRoutes
 *
 * @type {{applyRoutes: TunnelServerRoutes.applyRoutes, getRequestMiddleware: TunnelServerRoutes.getRequestMiddleware}}
 */
var TunnelServerRoutes = {
    request: null,
    beforeRequest : function (request, response) {
        this.request = request;

    },
    afterRequest : function (request, response) {
        //console.log('after request');
    },
    applyRoutes: function (app) {


        /**
         * Middleware called before all request
         */
        app.use(function (request, response, next) {

            TunnelServerRoutes.beforeRequest(request,response);

            next();
        });

        app.get('/', function (request, response) {
            var index = fs.readFileSync(path.join(__dirname, '../../public', 'index.html'));

            var indexPage = mustache.render(index.toString(), Tunnel);


            response.setHeader('Content-Type', 'text/html');
            response.end(indexPage);
        });
        app.post('/', function (request, response) {
            response.send('POST / working fine!');
        });
        app.get('/log', function (request, response) {
           response.send("logs here");
        });


        /**
         * Faz o processamento da requisição e trata a resposta
         */
        app.use(function (request, response) {

            TunnelRequestMiddleware.process(request, response);
            /**
             * Não chama o next() porque está é a ultima etapa
             */
            TunnelServerRoutes.afterRequest(request, response);
        });
    },

    getRequestMiddleware: function () {
        return TunnelRequestMiddleware;
    },
    getLastRequest: function() {
        return this.request;
    }

};

module.exports = TunnelServerRoutes;