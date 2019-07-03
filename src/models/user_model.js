/*
 * User {
 *   _id            : ObjectId!
 *   facebook_id    : String!
 *   facebook       : Object
 * }
 */

class UserModel {
    constructor(manager) {
        this.manager = manager;
        this.collection = manager.db.collection("users");
    }

    async findOneById(_id) {
        const user = await this.collection.findOne({ _id });
        return user;
    }

    async findOneByFacebookId(facebook_id) {
        const user = await this.collection.findOne({ facebook_id });
        return user;
    }

    async findOneByGoogleId(google_id) {
        const user = await this.collection.findOne({ google_id });
        return user;
    }

    async create({ name, facebook_id, facebook, email, google_id, google }) {
        const new_user = {
            name,
            facebook_id,
            facebook,
            google_id,
            google,
            email,
            email_status: "UNVERIFIED",
        };

        await this.collection.insertOne(new_user);
        return new_user;
    }
}

module.exports = UserModel;
module.exports.UNVERIFIED = "UNVERIFIED";
module.exports.SENT_VERIFICATION_LINK = "SENT_VERIFICATION_LINK";
module.exports.VERIFIED = "VERIFIED";
