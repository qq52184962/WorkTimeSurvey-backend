const request = require('request');

function accessTokenAuth(access_token) {
    return new Promise(function(resolve, reject) {
        if (! access_token) {
            throw new Error("access_token is required");
        }

        if (access_token === "") {
            throw new Error("access_token is required");
        }

        request.get({
            url: "https://graph.facebook.com/v2.6/me",
            qs: {
                access_token: access_token,
                fields: "id,name",
                format: "json",
            },
        }, function(error, response, body) {
            if (error) {
                reject(new Error("access_token is invalid"));
                return;
            }

            const content = JSON.parse(body);

            if (content.error) {
                reject(new Error("access_token is invalid"));
                return;
            }

            resolve({id: content.id, name: content.name});
        });
    });
}

module.exports = {
    accessTokenAuth,
};
