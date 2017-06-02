var TunnelDefaultConfigs = require('./../config/TunnelConfigs');

var request = require('request');
var Agent = require('socks5-http-client/lib/Agent');
var HttpsAgent = require('socks5-https-client/lib/Agent');

/**
 * Perform a request, supports: http, https, proxy request.
 * @type {TunnelHttpRequestor}
 */
var TunnelHttpRequestor = {
    consoleFlag: TunnelDefaultConfigs.consoleFlag,
    configs: TunnelDefaultConfigs,

    /**
     * Perform a request and return a callback
     * @param requestObject
     * @param response
     * @param callback
     */
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
         * Request options
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

        TunnelLogger.info(options);

        try {
            request(options, function (error, requestResponse) {

                if (error) {
                    callback(error, null, response);
                } else {
                    callback(null, requestResponse, response);
                }

            });
        } catch (error) {
            callback(error, null, response);
        }
    }
};


module.exports = TunnelHttpRequestor;