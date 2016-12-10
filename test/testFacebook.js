const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const facebook = require('../libs/facebook');
const nock = require('nock');

describe('libs/facebook.js', function() {
    describe('accessTokenAuth', function() {
        it('rejected if no access_token is passed', function() {
            return assert.isRejected(facebook.access_token_auth());
        });

        it('rejected if response contain error', function() {
            const access_token = 'fack_access_token';
            const response = {error: 'error'};

            nock('https://graph.facebook.com:443').get('/v2.6/me')
                .query({
                    access_token: access_token,
                    fields: "id,name",
                    format: "json",
                })
                .reply(200, response);
            return assert.isRejected(facebook.access_token_auth(access_token));
        });

        it('fullfilled if response is correct', function() {
            const access_token = 'fack_access_token';
            const response = {id: '-1', name: 'test'};

            nock('https://graph.facebook.com:443').get('/v2.6/me')
                .query({
                    access_token: access_token,
                    fields: "id,name",
                    format: "json",
                })
                .reply(200, response);
            return assert.becomes(facebook.access_token_auth(access_token), response);
        });
    });
});

