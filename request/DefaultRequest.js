class DefaultRequest {
    constructor() {
        this.method = 'GET';
        this.url = '';
        this.params = '';
        this.headers = {};
        this.body = '';
    }

    setMethod(method) {
        this.method = method;
    }

    getMethod() {
        return this.method;
    }

    setUrl(url) {
        this.url = url;
    }

    getUrl() {
        return this.url;
    }

    setParams(params) {
        this.params = params;
    }

    getParams() {
        return this.params;
    }

    setHeaders(headers) {
        this.headers = headers;
    }

    getHeaders() {
        return this.headers;
    }

    setBody(body) {
        this.body = body;
    }

    getBody() {
        return this.body;
    }
}

module.exports = DefaultRequest;