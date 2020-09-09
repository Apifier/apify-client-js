const ow = require('ow');
const ResourceClient = require('../base/resource_client');
const {
    pluckData,
    parseDateFields,
    catchNotFoundOrThrow,
} = require('../utils');

class RequestQueueClient extends ResourceClient {
    /**
     * @param {ApiClientOptions} options
     * @param {object} [userOptions]
     * @param {string} [userOptions.clientKey]
     */
    constructor(options, userOptions = {}) {
        super({
            resourcePath: 'request-queues',
            ...options,
        });
        this.clientKey = userOptions.clientKey;
    }

    async listHead(options = {}) {
        ow(options, ow.object.exactShape({
            limit: ow.optional.number,
        }));
        const response = await this.httpClient.call({
            url: this._url('head'),
            method: 'GET',
            params: this._params(options),
        });
        return parseDateFields(pluckData(response.data));
    }

    async addRequest(request, options = {}) {
        ow(request, ow.object);
        ow(options, ow.object.exactShape({
            forefront: ow.optional.boolean,
        }));

        const response = await this.httpClient.call({
            url: this._url('requests'),
            method: 'POST',
            data: request,
            params: this._params({
                forefront: options.forefront,
                clientKey: this.clientKey,
            }),
        });
        return parseDateFields(pluckData(response.data));
    }

    async getRequest(id) {
        ow(id, ow.string);
        const requestOpts = {
            url: this._url(`requests/${id}`),
            method: 'GET',
            params: this._params(),
        };
        try {
            const response = await this.httpClient.call(requestOpts);
            return parseDateFields(pluckData(response.data));
        } catch (err) {
            return catchNotFoundOrThrow(err);
        }
    }

    async updateRequest(request, options = {}) {
        ow(request, ow.object.partialShape({
            id: ow.string,
        }));
        ow(options, ow.object.exactShape({
            forefront: ow.optional.boolean,
        }));

        const response = await this.httpClient.call({
            url: this._url(`requests/${request.id}`),
            method: 'PUT',
            data: request,
            params: this._params({
                forefront: options.forefront,
                clientKey: this.clientKey,
            }),
        });
        return parseDateFields(pluckData(response.data));
    }

    async deleteRequest(id) {
        ow(id, ow.string);
        await this.httpClient.call({
            url: this._url(`requests/${id}`),
            method: 'DELETE',
            params: this._params({
                clientKey: this.clientKey,
            }),
        });
    }
}

module.exports = RequestQueueClient;
