var TunnelRequestMiddleware = require('./TunnelRequestMiddleware')

var fs = require('fs')
var path = require('path')
var mustache = require('mustache')
var TunnelLoggerConfigs = require('../config/TunnelLoggerConfigs')

/**
 * Class TunnelServerRoutes
 *
 * @type {{applyRoutes: TunnelServerRoutes.applyRoutes, getRequestMiddleware: TunnelServerRoutes.getRequestMiddleware}}
 */
var TunnelServerRoutes = {
  request: null,
    /**
     * Middleware called before all request
     */
  beforeRequest: function (request, response, next) {
    this.request = request
    next()
  },

    /**
     * Middleware called after all request
     */
  afterRequest: function (request, response) {
        // console.log('after request');
  },

    /**
     * Routes of the application
     */
  applyRoutes: function (app) {
    app.use(this.beforeRequest)

    app.get('/', function (request, response) {
      var index = fs.readFileSync(path.join(__dirname, '../../public', 'index.html'))
      var indexPage = mustache.render(index.toString(), Tunnel)

      response.setHeader('Content-Type', 'text/html')
      response.end(indexPage)
    })

    app.post('/', function (request, response) {
      response.send('POST / working fine!')
    })

    app.get('/log', function (request, response) {
      var logs = fs.readFileSync(path.join(__dirname, '../../public', 'logs.html'))
      var logsPage = mustache.render(logs.toString(), Tunnel)

      response.setHeader('Content-Type', 'text/html')
      response.end(logsPage)
    })

    app.get('/log/*', function (request, response) {
      var url = request.originalUrl.split('/')
            // var fileName = './logs/' + url[2];
      var fileName = url[2]
      var filePath = path.join(process.cwd(), TunnelLoggerConfigs.filePath, fileName)

      try {
        fs.readFileSync(path.join(process.cwd(), TunnelLoggerConfigs.filePath, fileName))
        response.download(filePath)
      } catch (error) {
        TunnelRequestMiddleware.getErrorPage(response, error)
      }
    })

        /**
         * Perform the request process and manage the response
         */
    app.use(function (request, response, next) {
      TunnelRequestMiddleware.process(request, response)

      next()
    })

    app.use(TunnelServerRoutes.afterRequest)
  },

    /**
     * Return request middleware
     * @return TunnelRequestMiddleware
     */
  getRequestMiddleware: function () {
    return TunnelRequestMiddleware
  },

  getLastRequest: function () {
    return this.request
  }

}

module.exports = TunnelServerRoutes
