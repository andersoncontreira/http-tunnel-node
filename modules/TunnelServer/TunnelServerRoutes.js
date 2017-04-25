var TunnelRequestMiddleware = require("./TunnelRequestMiddleware");

var fs = require('fs');
var path = require('path');

var TunnelServerRoutes = {

    applyRoutes: function (app) {

        app.get('/', function (request, response) {
            var index = fs.readFileSync(path.join(__dirname, '../../public', 'index.html'));
            response.setHeader('Content-Type', 'text/html');
            response.end(index);
        });
        app.post('/', function (request, response) {
            response.send('POST / working fine!');
        });

        /**
         * Middlewares
         */
        /**
         * Faz o processamento da requisição e trata a resposta
         */
        app.use(function (request, response) {
            TunnelRequestMiddleware.process(request, response);
            /**
             * Não chama o next() porque está é a ultima etapa
             */
        });
    }
};

module.exports = TunnelServerRoutes;