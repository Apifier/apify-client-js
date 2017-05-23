export const APIFY_ERROR_NAME = 'ApifyError';

export const INVALID_PARAMETER_ERROR_TYPE = 'INVALID_PARAMETER';
export const REQUEST_FAILED_ERROR_TYPE = 'REQUEST_FAILED';
export const REQUEST_FAILED_ERROR_MESSAGE = 'Server request failed.';

export default class ApifyError extends Error {
    constructor(type, message, details) {
        super(message);
        this.name = APIFY_ERROR_NAME;
        this.type = type;
        this.details = details;

        Error.captureStackTrace(this, ApifyError);
    }
}