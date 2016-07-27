class HttpError extends Error {
    /*
     * @param  message  any
     * @param  code     int
     */
    constructor(message, code) {
        super(message);
        this.status = code;
    }
}

module.exports.HttpError = HttpError;
