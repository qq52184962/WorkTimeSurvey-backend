const { OAuth2Client } = require("google-auth-library");

const { GOOGLE_CLIENT_ID } = process.env;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyIdToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        // Specify the CLIENT_ID of the app that accesses the backend

        audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return payload;
}

module.exports = {
    verifyIdToken,
};
