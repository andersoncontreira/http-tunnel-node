var cmd = require('node-cmd');
var express = require('express');
var bodyParser = require('body-parser');
var program = require('commander');
var utf8 = require('utf8');
var favicon = require('serve-favicon');
var path = require('path');
var http = require('http');
var request = require('request');
var url = require('url');
var Agent = require('socks5-http-client/lib/Agent');
var HttpsAgent = require('socks5-https-client/lib/Agent');
var DefaultRequest = require('./request/DefaultRequest');


/**
 * Default
 */
var consoleFlag = 'tunnel-> ';
var socks5Host = '127.0.0.1';
var socks5Port = 2222;
var httpPort = 3456;
var useSocksFive = true;
/**
 * Ultima requisição
 * Serve para permitir a navegação
 * @type {Object}
 */
var lastRequest = null;



program
    .version('0.0.1')
    .option('-s, --socks5-host [value]', 'Socks5 proxy Host (default: 127.0.0.1)')
    .option('-r, --socks5-port [value]', 'Socks5 proxy Port (default: 2222)')
    .option('-t, --http-port [value]', 'Http Port (default: 3456)')
    .option('-x, --use-proxy [value]', 'Uses socks5 proxy (default: true)');

program.parse(process.argv);

socks5Host = (program.socks5Host)? program.socks5Host : socks5Host;
socks5Port = (program.socks5Port)? program.socks5Port : socks5Port;
httpPort = (program.httpPort)? program.httpPort : httpPort;
useSocksFive = (program.useProxy)? true: false;

if (useSocksFive) {
    console.log(consoleFlag + ' Using socks5 proxy!');
} else {
    console.log(consoleFlag + ' Not using a socks5 proxy!');
}

var app = express();
//Favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.jpg')));
//JSON
app.use(bodyParser.json());
// FORM-DATA
app.use(bodyParser.urlencoded({extended: false}));
//Read XML request as Text
app.use(bodyParser.text({type: ['*/xml', '+xml']}));

function parseUrlRequested(urlRequested) {
    return url.parse(urlRequested);
}


function encodeRequestObject(requestObject) {


    var urlRequested = '';
    urlRequested += requestObject['protocol']+'//';
    urlRequested += requestObject['host']+'/';
    if (requestObject['pathname'] !== null) {
        urlRequested += requestObject['pathname'];
    }
    if (requestObject['query'] !== null) {
        urlRequested += '?'+requestObject['query'];
    }
    if (requestObject['hash'] !== null) {
        urlRequested += requestObject['hash'];
    }




    return urlRequested;
}

function executeHttpRequest(defaultRequest, callback) {

    var agent = Agent;

    if (defaultRequest.getUrl().match('https')) {
        agent = HttpsAgent;
    }

    if (lastRequest != null) {
        var requestObject = url.parse(defaultRequest.getUrl());

        /**
         * Se estiver nulo as propriedades básicas da requisição, significa que é uma
         * requisição no mesmo servidor, por exemplo o caso do google:
         * Requisição Inicial:
         * http://www.google.com/
         * Sub-requisições:
         * textinputassistant/tia.png
         * client_204?&atyp=i&biw=1920&bih=463&ei=RvnkWJzgK4KfwASJ-Y-gAQ
         * ....
         */
        if (requestObject.hasOwnProperty('protocol') && requestObject['protocol'] == null
            && requestObject.hasOwnProperty('host') && requestObject['host'] == null) {

            var notCopy = ['hash','query','search'];
            /**
             * Sobrescreve os parametros nulos
             */
            for (var p in requestObject) {
                if( requestObject[p] == null && notCopy.indexOf(p) === -1) {
                    console.log(p);
                    requestObject[p] = lastRequest[p];
                }
            }
        }
        /**
         * converte o Objeto para a url
         */
        //console.log(requestObject, lastRequest);
        var requestedUrl = encodeRequestObject(requestObject);
        defaultRequest.setUrl(requestedUrl);

    }


    var options = {
        method: defaultRequest.getMethod(),
        url: defaultRequest.getUrl()
    };

    if (useSocksFive) {
        options['agentClass'] = agent;
        options['agentOptions'] = {
            socksHost: socks5Host,
            socksPort: socks5Port
        };
    }

    if (defaultRequest.getMethod() != 'GET') {
        options['body'] = defaultRequest.getBody();
        options['headers'] = defaultRequest.getHeaders();
    }

    if (options.hasOwnProperty('headers') && options['headers'].hasOwnProperty('host')) {
        /**
         * Se for localhost remove porque a maioria das locadoras dão erro de resposta http
         */
        if (options['headers']['host'].match('localhost')) {
            delete options['headers']['host'];
        }

    }
    console.log(consoleFlag + ' options:', options);


    request(options, function (error, res) {

        console.log(consoleFlag + ' ----------------------------------- ');
        console.log(consoleFlag + ' Response ');
        console.log(consoleFlag + ' ----------------------------------- ');

        if (error) {
            console.log(consoleFlag + ' Response-Status: Error!');
            console.log(consoleFlag + ' ' + error.message);
            callback(error, res);
        } else {

            var requestObject = parseUrlRequested(defaultRequest.getUrl());
            /**
             * Sobrescreve o objeto da ultima requisição
             */
            if (requestObject.hasOwnProperty('protocol') && requestObject['protocol'] != null
                && requestObject.hasOwnProperty('host') && requestObject['host'] != null) {
                lastRequest = requestObject;
            }
            console.log(consoleFlag + ' Response-Status: Success!');

            callback(null, res);
        }
    });
}


app.get('/', function (req, res) {
    res.send('GET / working fine!');
});
app.post('/', function (req, res) {
    res.send('POST / working fine!');
});


// middleware para tratamento de requisição
app.use(function (req, res, next) {


    //remover headers
    //compressão
    if (req.headers.hasOwnProperty('accept-encoding')) {
        delete req.headers['accept-encoding'];
    }

    /**
     * Testes
     * @type {string}
     */
    //req.headers['content-type'] = 'text/html; charset=UTF-8';

    var method = req.method;
    var requestedUrl = req.url.slice(1, req.length);
    var headers = req.headers;
    var body = req.body;

    console.log(consoleFlag + ' ----------------------------------- ');
    console.log(consoleFlag + ' Request');
    console.log(consoleFlag + ' ----------------------------------- ');
    console.log(consoleFlag + ' method:', method);
    console.log(consoleFlag + ' url:', requestedUrl);
    console.log(consoleFlag + ' headers:', headers);
    console.log(consoleFlag + ' body:', body);

    var defaultRequest = new DefaultRequest();
    defaultRequest.setMethod(method);
    defaultRequest.setUrl(requestedUrl);
    defaultRequest.setHeaders(headers);
    defaultRequest.setBody(body);

    executeHttpRequest(defaultRequest, function (error, result) {
        if (error) {
            res.send(error.message);

        } else {

            for (var header in result.headers) {
                res.removeHeader(header);

                res.setHeader(header, result.headers[header]);

            }

            /**
             * Testes
             */
            //res.setHeader('content-type','text/html; charset=UTF-8');

            /**
             * Tratar o tipo de retorno quando imagem etc
             */
            console.log('result.headers',result.headers);
            res.send(result.body);
            //res.send(utf8.decode(result.body));
        }
    });
});

app.listen(httpPort, function () {
    console.log(consoleFlag + ' Server up in port:' + httpPort);
});
