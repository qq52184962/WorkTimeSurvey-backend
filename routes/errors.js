class HttpError extends Error {
    constructor(message, code) {
        super(message);
        this.status = code;
    }
}

module.exports.HttpError = HttpError;
