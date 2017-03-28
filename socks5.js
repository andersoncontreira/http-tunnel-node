var cmd = require('node-cmd');
var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var path = require('path');
var http = require('http');
var request = require('request');
var Agent = require('socks5-http-client/lib/Agent');
var HttpsAgent = require('socks5-https-client/lib/Agent');
var DefaultRequest = require('./request/DefaultRequest');

/**
 * Default
 */
var consoleFlag = 'socks5-> ';
var socks5Host = '127.0.0.1';
var socks5Port = 2222;
var httpPort = 3456;
var useSocksFive = true;

// var program = require('commander');
//
// program
//     .version('0.0.1')
//     .option('-h, --socks5Host', 'Socks5 proxy Host (default: 127.0.0.1)')
//     .option('-p, --socks5Port', 'Socks5 proxy Port (default: 2222)')
//     .option('-h, --http-port', 'Http Port (default: 3456)')
//     .option('-u, --proxy', 'Uses socks5 proxy (true or false)')
//     .parse(process.argv);
//
// socks5Host = (program.socks5Host)? program.socks5host : socks5Host;
// socks5Port = (program.socks5Port)? program.socks5port : socks5Port;
// httpPort = (program.httpPort)? program.httpPort : httpPort;
// useSocksFive = (program.proxy)? true: false;
//
// console.log(program.httpPort, program.proxy);

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


function executeHttpRequest(defaultRequest, callback) {

    var agent = Agent;

    if (defaultRequest.getUrl().match('https')) {
        agent = HttpsAgent;
    }
    //process.exit(0);

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


    console.log(consoleFlag + ' options:', options);


    request(options, function (error, res) {
        //console.log('aq');
        //console.log(res.headers);
        //console.log('res',res);
        //var data = "";

        //if(res != undefined && res.hasOwnProperty('body')) {
        //    data = res.body;
        //}

        console.log(consoleFlag + ' ----------------------------------- ');
        console.log(consoleFlag + ' Response ');
        console.log(consoleFlag + ' ----------------------------------- ');
        //console.log(consoleFlag + ' Response-length: ' + data.length);
        //console.log(consoleFlag + ' Response-length: ' + res.length);

        if (error) {
            console.log(consoleFlag + ' Response-status: Error!');
            console.log(consoleFlag + ' ' + error.message);
            callback(error, res);
        } else {
            console.log(consoleFlag + ' Response-status: Success!');
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

    var method = req.method;
    var url = req.url.slice(1, req.length);
    var headers = req.headers;
    var body = req.body;

    console.log(consoleFlag + ' ----------------------------------- ');
    console.log(consoleFlag + ' Request');
    console.log(consoleFlag + ' ----------------------------------- ');
    console.log(consoleFlag + ' method:', method);
    console.log(consoleFlag + ' url:', url);
    console.log(consoleFlag + ' headers:', headers);
    console.log(consoleFlag + ' body:', body);

    var defaultRequest = new DefaultRequest();
    defaultRequest.setMethod(method);
    defaultRequest.setUrl(url);
    defaultRequest.setHeaders(headers);
    defaultRequest.setBody(body);

    executeHttpRequest(defaultRequest, function (error, result) {
        if (error) {
            res.send(error.message);
        } else {

            for (var header in result.headers) {
                res.removeHeader(header);

                //console.log("cr:->",header,result.headers[header]);

                res.setHeader(header, result.headers[header]);

                //console.log("gt:->",header,res.getHeader(header));
            }
            res.send(result.body);
        }
    });
});

app.listen(httpPort, function () {
    console.log(consoleFlag + ' server up in port:' + httpPort);
});
