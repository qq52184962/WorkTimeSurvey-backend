/*
 * A middleware to add CORS header
 *
 * Middleware should bind with the route you want to pass
 */
module.exports = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
};
