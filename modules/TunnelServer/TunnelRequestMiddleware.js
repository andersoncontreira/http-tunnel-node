var Tunnel = require('./../Tunnel');
var DefaulRequest = require('../DefaultRequest');
var TunnelHttpRequestor = require('./TunnelHttpRequestor');
var TunnelMessage = require('./../Tunnel/TunnelMessage');

var url = require("url");
var fs = require("fs");
var path = require("path");

var mustache = require('mustache');

var TunnelRequestMiddleware = {

    notAllowedHeaders: [
        'accept-encoding'
    ],
    request: null,
    lastRequest: null,
    requestObject: null,
    lastRequestObject: null,

    removeHeaders: function (request) {
        for (var index in this.notAllowedHeaders) {
            var header = this.notAllowedHeaders[index];

            if (request.headers.hasOwnProperty(header)) {
                delete request.headers[header];
            }
        }

        if (request.headers.hasOwnProperty('host')) {
            /**
             * Se for localhost remove porque a maioria das locadoras dão erro de resposta http
             */
            if (request.headers['host'].match('localhost')) {
                delete request.headers['host'];
            }

        }


        if (request.headers.hasOwnProperty('referer')) {

            if (request.headers['referer'].match('localhost')) {
                var referer = request.headers['referer'];
                request.headers['referer'] = referer.replace('http://localhost:'+Tunnel.configs.httpPort+'/','');
            } else if (request.headers['referer'].match('tunnel.rentcars')) {
                var referer = request.headers['referer'];
                request.headers['referer'] = referer.replace('http://tunnel.rentcars.lan:'+Tunnel.configs.httpPort+'/','');
            }
        }

        return request;
    },
    logRequest: function (textFlag, request) {
        if (request instanceof DefaulRequest) {
            var method = request.getMethod();
            var requestedUrl = request.getRequestedUrl();
            var headers = request.getHeaders();
            var body = request.getBody();
        } else {
            var method = request.method;
            var requestedUrl = request.url.slice(1, request.length);
            var headers = request.headers;
            var body = request.body;
        }


        console.log(Tunnel.consoleFlag + ' +----------------------------------- ');
        console.log(Tunnel.consoleFlag + ' | ' + textFlag + ' BEGIN ');
        console.log(Tunnel.consoleFlag + ' +----------------------------------- ');
        console.log(Tunnel.consoleFlag + ' Method:', method);
        console.log(Tunnel.consoleFlag + ' Requested Url:', requestedUrl);
        console.log(Tunnel.consoleFlag + ' Headers:');
        console.log(headers);
        console.log(Tunnel.consoleFlag + ' Body:', body);
        console.log(Tunnel.consoleFlag + ' +----------------------------------- ');
        console.log(Tunnel.consoleFlag + ' | ' + textFlag + ' END ');
        console.log(Tunnel.consoleFlag + ' +----------------------------------- ');
    },
    applyParentProperties: function (request) {
        /**
         * Só aplica se tiver uma requisição completa
         */
        if (TunnelRequestMiddleware.lastRequestObject != null && TunnelRequestMiddleware.lastRequestObject.getRequestedUrl() != '') {
            var lastUrl = TunnelRequestMiddleware.lastRequestObject.getRequestedUrl();
            var requestObject = TunnelRequestMiddleware.parseUrl(lastUrl);


            console.log('------------------------------------ ');
            console.log(Tunnel.consoleFlag + ' Call: TunnelRequestMiddleware.applyParentProperties(request)');
            console.log('------------------------------------ ');
            console.log('lastUrl',lastUrl);
            console.log('requestObject',requestObject);
            console.log('request.url',request.url);
            console.log('request.headers.referer',request.headers.referer);
            console.log('lastRequest.headers.referer',TunnelRequestMiddleware.lastRequest.headers.referer);
            console.log('------------------------------------ ');

            /**
             * TODO não funciona bem para navegação cruzada, aonde temos várias abas abertas,
             * A classe perde a referência do pai
             */
            /**
             * Só aplica se não encontrar a url anterior e também não encontrar nenhum protocolo
             */
            if (!request.url.match(requestObject.host)
                && !(request.url.match('http') || request.url.match('https'))
            ) {

                if (request.url[0] == '/') {
                    request.url = requestObject.protocol + '//'+requestObject.host + request.url;
                } else {
                    request.url = requestObject.protocol + '//'+requestObject.host + '/' + request.url;
                }

            }
        }



        return request;
    },
    process: function (request, response) {

        console.log('------------------------------------ ');
        console.log(Tunnel.consoleFlag + ' Call: TunnelRequestMiddleware.process(request, response)');
        console.log('------------------------------------ ');
        console.log('REQUEST BEGIN ');
        console.log('------------------------------------ ');

        this.request = request;

        this.logRequest('Original Request:', request);

        request = this.removeHeaders(request);

        /**
         * Se for uma pesquisa que está pegando subitens então aplica parametros, por exemplo o caso do google:
         * Requisição Inicial:
         * http://www.google.com/
         *
         * Sub-requisições:
         * /textinputassistant/tia.png
         *
         * /client_204?&atyp=i&biw=1920&bih=463&ei=RvnkWJzgK4KfwASJ-Y-gAQ
         *
         */
        this.applyParentProperties(request);

        var method = request.method;
        if (request.url[0] == '/') {
            var requestedUrl = request.url.slice(1, request.length);
        } else {
            var requestedUrl = request.url;
        }

        var headers = request.headers;
        var body = request.body;




        var requestObject = new DefaulRequest();
        requestObject.setRequestedUrl(requestedUrl);
        requestObject.setMethod(method);
        requestObject.setHeaders(headers);
        requestObject.setBody(body);

        this.requestObject = requestObject;

        this.logRequest('Parsed Request:', requestObject);


        this.executeHttpRequest(requestObject, response);

    },

    executeHttpRequest: function (requestObject, response) {

        TunnelHttpRequestor.configs = Tunnel.configs;
        TunnelHttpRequestor.execute(requestObject, response, this.responseCallback);
    },

    getErrorPage: function (response, error) {
        var errorPage = fs.readFileSync(path.join(__dirname, '../../public', 'error.html'));

        errorPage = mustache.render(errorPage.toString(), new TunnelMessage(error.code, error.message));

        response.setHeader('Content-Type', 'text/html');
        response.end(errorPage);
    },
    /**
     *
     * @param ServerResponse response
     * @param Object headers
     */
    overrideHeaders: function (response, headers) {
        for (var key in headers) {

            /**
             * Debug
             */
            if (Tunnel.configs.debug) {
                console.log('DEBUG');
                console.log('key:', key);
                console.log('response value:', response.getHeader(key));
                console.log('output headers value:', headers[key]);
                console.log('');
            }

            if (!response.getHeader(key)) {
                response.setHeader(key, headers[key]);
            }


        }
    },
    parseUrl: function (requestedUrl) {
        return url.parse(requestedUrl);
    },
    /**
     *
     * @param Error|null error
     * @param ServerResponse result
     * @param ServerResponse response
     */
    responseCallback: function (error, result, response) {
        console.log('----------------------------------- ');
        console.log(Tunnel.consoleFlag + ' Call: TunnelRequestMiddleware.responseCallback(error, result, response)');
        console.log('----------------------------------- ');

        console.log(Tunnel.consoleFlag + '+----------------------------------- ');
        console.log(Tunnel.consoleFlag + '| Response');
        console.log(Tunnel.consoleFlag + '+----------------------------------- ');
        if (error) {

            console.log(Tunnel.consoleFlag + ' Error Code: ' + error.code);
            console.log(Tunnel.consoleFlag + ' Error Message: ' + error.message);

            TunnelRequestMiddleware.getErrorPage(response, error);
        } else {

            var statusCode = result.statusCode;
            var statusMessage = result.statusMessage;
            var headers = result.headers;
            var body = result.body;


            console.log(Tunnel.consoleFlag + ' Status Code:', statusCode);
            console.log(Tunnel.consoleFlag + ' Status Message:', statusMessage);
            console.log(Tunnel.consoleFlag + ' Headers:');
            console.log(headers);


            if (result.hasOwnProperty('body')) {
                var requestObject = TunnelRequestMiddleware.parseUrl(TunnelRequestMiddleware.requestObject.getRequestedUrl());
                /**
                 * Armazena a ultima request que possui todos os params
                 * @type DefaultRequest
                 */
                if (requestObject.hasOwnProperty('protocol') && requestObject['protocol'] != null
                    && requestObject.hasOwnProperty('host') && requestObject['host'] != null) {

                    TunnelRequestMiddleware.lastRequestObject = TunnelRequestMiddleware.requestObject;
                    TunnelRequestMiddleware.lastRequest = TunnelRequestMiddleware.request;
                }


                TunnelRequestMiddleware.overrideHeaders(response, headers);

                response.body = body;
                response.end(body);
            } else {
                //Tratar errors específicos aqui
                response.end('Verificar tivemos problemas');

            }


            console.log('------------------------------------ ');
            console.log('REQUEST END ');
            console.log('------------------------------------ ');


        }
    }
};

module.exports = TunnelRequestMiddleware;