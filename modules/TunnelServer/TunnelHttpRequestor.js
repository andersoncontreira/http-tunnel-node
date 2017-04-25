var TunnelDefaultConfigs = require('./../config/tunnel.configs');

var request = require('request');
var Agent = require('socks5-http-client/lib/Agent');
var HttpsAgent = require('socks5-https-client/lib/Agent');

var TunnelHttpRequestor = {
    consoleFlag: TunnelDefaultConfigs.consoleFlag,
    configs: TunnelDefaultConfigs,

    execute: function (requestObject, response, callback) {
        /**
         * Socks5 Agents
         */
        //HTTP
        var agent = Agent;

        //HTTPS
        if (requestObject.getRequestedUrl().match('https')) {
            agent = HttpsAgent;
        }

        /**
         * Opções de requisição
         */
        var options = {
            method: requestObject.getMethod(),
            url: requestObject.getRequestedUrl()
        };

        if (this.configs.useSocksFive) {
            options['agentClass'] = agent;
            options['agentOptions'] = {
                socksHost: this.configs.socks5Host,
                socksPort: this.configs.socks5Port
            };
        }

        if (requestObject.getMethod() != 'GET') {
            options['body'] = requestObject.getBody();
            options['headers'] = requestObject.getHeaders();
        }

        console.log('------------------------------------ ');
        console.log(this.consoleFlag + ' Call: TunnelHttpRequestor.execute(requestObject, response, callback)');
        console.log('------------------------------------ ');
        console.log('| Request Options:');
        console.log('------------------------------------ ');
        console.log(options);
        console.log('------------------------------------ ');


        request(options, function (error, requestResponse) {

            if (error) {
                callback(error, null, response);
            } else {
                callback(null, requestResponse, response);
            }

        });
    }
};

module.exports = TunnelHttpRequestor;