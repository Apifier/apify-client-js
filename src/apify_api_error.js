const CLIENT_METHOD_REGEX = /at ([A-Z][a-z]+(Collection)?Client\.[A-z]+) \(/;

class ApifyApiError extends Error {
    constructor(response, attempt) {
        let message;
        let type;
        if (response.data && response.data.error) {
            const { error } = response.data;
            message = error.message;
            type = error.type;
        } else {
            let dataString;
            try {
                dataString = JSON.stringify(response.data, null, 2);
            } catch (err) {
                dataString = `${response.data}`;
            }
            message = `Unexpected error: ${dataString}`;
        }
        super(message);

        this.name = this.constructor.name;
        this.clientMethod = this._extractClientAndMethodFromStack();
        this.statusCode = response.status;
        this.type = type;
        this.attempt = attempt;
        this.httpMethod = response.config && response.config.method;
        this.path = this._safelyParsePathFromResponse(response);

        // Overwrite stack. For API errors, the line numbers
        // are not as important as showing the API call details.
        this.stack = this._createApiStack();
    }

    _safelyParsePathFromResponse(response) {
        const urlString = response.config && response.config.url;
        let url;
        try {
            url = new URL(urlString);
        } catch (err) {
            return urlString;
        }
        return url.pathname + url.search;
    }

    _extractClientAndMethodFromStack() {
        const match = this.stack.match(CLIENT_METHOD_REGEX);
        // Client and method are in the first
        // and second capturing group
        if (match) return match[1];
    }

    _createApiStack() {
        const {
            name,
            ...props
        } = this;
        const stack = Object.entries(props)
            .map(([k, v]) => `  ${k}: ${v}`)
            .join('\n');

        return `${name}: ${this.message}${stack}`;
    }
}

module.exports = ApifyApiError;