var Tunnel = require('./../Tunnel');
var DefaulRequest = require('../DefaultRequest');
var TunnelHttpRequestor = require('./TunnelHttpRequestor');
var TunnelMessage = require('./../Tunnel/TunnelMessage');
var TunnelLogger = require('../TunnelLogger');

var url = require("url");
var fs = require("fs");
var path = require("path");
var mustache = require('mustache');

/**
 * Middleware responsible for management all steps of the requests
 * @type {TunnelRequestMiddleware}
 */
var TunnelRequestMiddleware = {

    notAllowedHeaders: [
        'accept-encoding'
    ],
    request: null,
    response: null,
    lastRequest: null,
    requestObject: null,
    lastRequestObject: null,

    /**
     * Remove the unnecessary properties from headers
     * @param request
     * @return {*}
     */
    removeHeaders: function (request) {
        for (var index in this.notAllowedHeaders) {
            var header = this.notAllowedHeaders[index];

            if (request.headers.hasOwnProperty(header)) {
                delete request.headers[header];
            }
        }

        if (request.headers.hasOwnProperty('host')) {
            /**
             * Remove headers if it's on localhost, because the most webservices return a http response error
             */
            if (request.headers['host'].match('localhost')) {
                delete request.headers['host'];
            }
        }

        if (request.headers.hasOwnProperty('referer')) {

            if (request.headers['referer'].match('localhost')) {
                var referer = request.headers['referer'];
                request.headers['referer'] = referer.replace('http://localhost:' + Tunnel.configs.httpPort + '/', '');
            } else if (request.headers['referer'].match('tunnel.rentcars')) {
                var referer = request.headers['referer'];
                request.headers['referer'] = referer.replace('http://tunnel.rentcars.lan:' + Tunnel.configs.httpPort + '/', '');
            }
        }

        return request;
    },

    /**
     * Show logs on console about requests
     * @param String textFlag
     * @param Request request
     */
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
        console.log(JSON.stringify(headers));
        console.log(Tunnel.consoleFlag + ' Body:', body);
        console.log(Tunnel.consoleFlag + ' +----------------------------------- ');
        console.log(Tunnel.consoleFlag + ' | ' + textFlag + ' END ');
        console.log(Tunnel.consoleFlag + ' +----------------------------------- ');
    },

    /**
     * Apply properties on current request if it's a sub request
     * @param Request request
     * @return {Request}
     */
    applyParentProperties: function (request) {
        /**
         * Apply when request is finished
         */
        if (TunnelRequestMiddleware.lastRequestObject != null && TunnelRequestMiddleware.lastRequestObject.getRequestedUrl() != '') {
            var lastUrl = TunnelRequestMiddleware.lastRequestObject.getRequestedUrl();
            var lastRequestObject = TunnelRequestMiddleware.parseUrl(lastUrl);

            var requestedUrl = this.getRequestedUrl(request);

            var currentRequestObject = TunnelRequestMiddleware.parseUrl(requestedUrl);

            var message = {
                lastUrl: lastUrl,
                requestUrl: request.url,
                lastRequestObject: lastRequestObject,
                currentRequestObject: currentRequestObject,
                requestHeadersReferer: request.headers.referer,
                lastRequestHeadersReferer: TunnelRequestMiddleware.lastRequest.headers.referer
            };

            TunnelLogger.info(message);

            /**
             * Isn't works fine when it's on cross navigation, where we have some tabs opened
             * Class lose your main reference
             */
            /**
             * Applicable if doesn't find the current host and if has the same protocol
             */
            if (currentRequestObject.host == null) {

                if (request.url[0] == '/') {
                    request.url = lastRequestObject.protocol + '//' + lastRequestObject.host + request.url;
                } else {
                    request.url = lastRequestObject.protocol + '//' + lastRequestObject.host + '/' + request.url;
                }

            }
        }
        console.log('------------------------------------ ');
        console.log('Result: ');
        console.log('------------------------------------ ');
        console.log(request.url, request.headers);
        console.log('------------------------------------ ');

        return request;
    },

    /**
     * Apply necessary headers on request, including information from current server, e.g. host
     * @param Request request
     * @return {Request}
     */
    applyHeaders: function (request) {

        var requestedUrl = this.getRequestedUrl(request);

        var requestObject = TunnelRequestMiddleware.parseUrl(requestedUrl);

        if (requestObject.hasOwnProperty('hostname') && requestObject.hostname != '') {
            request.headers['host'] = requestObject.hostname;
        }

        return request;
    },

    /**
     * Check if current file exists
     * @param Request request
     * @return {boolean}
     */
    checkIfIsFile: function (request) {

        var file = this.getFile(request);

        return (file != null);
    },

    /**
     * Get the requested URL of request
     * @param Request request
     * @return {string}
     */
    getRequestedUrl: function (request) {

        if (request.url[0] == '/') {
            var requestedUrl = request.url.slice(1, request.length);
        } else {
            var requestedUrl = request.url;
        }

        return requestedUrl;
    },

    /**
     * Get content file if this exists
     * @param Request request
     * @return {String}
     */
    getFile: function (request) {

        var requestedUrl = this.getRequestedUrl(request);

        var requestObject = TunnelRequestMiddleware.parseUrl(requestedUrl);

        var pathname = requestObject.pathname;
        var file = null;

        try {
            file = fs.readFileSync(path.join(__dirname, '../../public', pathname));
        } catch (error) {
            /**
             * Isn't necessary manage this exception, because it verify if the file exists
             */
            //Tunnel.treatException(error);
        }

        return file;
    },

    /**
     * Process the request
     * @param request
     * @param response
     * @return {*}
     */
    process: function (request, response) {


        if (this.checkIfIsFile(request)) {
            response.end(this.getFile(request));
            return void(0);
        }

        this.request = request;
        this.response = response;

        this.logRequest('Original Request:', request);

        request = this.removeHeaders(request);

        /**
         * If there's a request collecting items from the same host, e.g. like a search request on Google.
         * Then some properties are applied on this request. It's applicable on sub requests.
         *
         * Initial request:
         * http://www.google.com/
         *
         * Sub request:
         * /textinputassistant/tia.png
         *
         * /client_204?&atyp=i&biw=1920&bih=463&ei=RvnkWJzgK4KfwASJ-Y-gAQ
         */
        request = this.applyParentProperties(request);

        var method = request.method;

        if (request.url.match('/http') || request.url[0] == '/') {
            var requestedUrl = request.url.slice(1, request.length);
        } else {
            var requestedUrl = request.url;
        }

        /**
         * Apply the necessary headers
         */
        request = this.applyHeaders(request);

        var headers = request.headers;
        var body = request.body;

        var requestObject = new DefaulRequest();
        requestObject.setRequestedUrl(requestedUrl);
        requestObject.setMethod(method);
        requestObject.setHeaders(headers);
        requestObject.setBody(body);

        this.requestObject = requestObject;

        this.logRequest('Parsed Request:', requestObject);

        try {
            this.executeHttpRequest(requestObject, response);
        } catch (e) {
            Tunnel.treatException(e);
            this.getErrorPage(response, e);
        }
    },

    /**
     * Execute the request
     * @param requestObject
     * @param response
     */
    executeHttpRequest: function (requestObject, response) {
        TunnelHttpRequestor.configs = Tunnel.configs;
        TunnelHttpRequestor.execute(requestObject, response, this.responseCallback);
    },

    /**
     * Show The error Page
     * @param response
     * @param error
     */
    getErrorPage: function (response, error) {
        var errorPage = fs.readFileSync(path.join(__dirname, '../../public', 'error.html'));

        errorPage = mustache.render(errorPage.toString(), new TunnelMessage(error.code, error.message));
        try {
            response.setHeader('Content-Type', 'text/html');
        } catch (error) {
            /**
             * Loggers aren't necessary
             */
        }

        response.end(errorPage);
    },

    /**
     * Override headers and show logs on console
     * @param ServerResponse response
     * @param Object headers
     */
    overrideHeaders: function (response, headers) {
        try {
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
        } catch (e) {
            Tunnel.treatException(e);
        }
    },

    /**
     * Parse Url
     * @param requestedUrl
     * @returns Url
     */
    parseUrl: function (requestedUrl) {
        return url.parse(requestedUrl);
    },

    /**
     * Manage response callback and show logs on console
     * @param Error|null error
     * @param ServerResponse result
     * @param ServerResponse response
     */
    responseCallback: function (error, result, response) {
        /**
         * Override the response
         */
        this.response = response;

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
            console.log(JSON.stringify(headers));


            if (result.hasOwnProperty('body')) {
                var requestObject = TunnelRequestMiddleware.parseUrl(TunnelRequestMiddleware.requestObject.getRequestedUrl());
                /**
                 * Store last request that has all params
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
                this.getErrorPage(response, new Error(Tunnel.ERRORS.SERVER.RESPONSE_BODY_UNDEFINED.MESSAGE, Tunnel.ERRORS.SERVER.RESPONSE_BODY_UNDEFINED.CODE));
            }

            console.log('------------------------------------ ');
            console.log('REQUEST END ');
            console.log('------------------------------------ ');

        }
    }
};

module.exports = TunnelRequestMiddleware;