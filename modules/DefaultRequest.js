// TODO: Mover para pasta Tunnel
/**
 * This is a value object for Tunnel Requests
 * @constructor
 */
function DefaultRequest () {
  this.method = 'GET'
  this.requestedUrl = ''
  this.params = ''
  this.headers = {}
  this.body = ''

  this.setMethod = function (method) {
    this.method = method
  }

  this.getMethod = function () {
    return this.method
  }

  this.setRequestedUrl = function (requestedUrl) {
    this.requestedUrl = requestedUrl
  }

  this.getRequestedUrl = function () {
    return this.requestedUrl
  }

  this.setParams = function (params) {
    this.params = params
  }

  this.getParams = function () {
    return this.params
  }

  this.setHeaders = function (headers) {
    this.headers = headers
  }

  this.getHeaders = function () {
    return this.headers
  }

  this.setBody = function (body) {
    this.body = body
  }

  this.getBody = function () {
    return this.body
  }
}

module.exports = DefaultRequest
