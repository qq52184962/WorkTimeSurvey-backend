class CompanyKeywordModel {
    constructor(manager) {
        this.manager = manager;
        this.collection = manager.db.collection("company_keywords");
    }

    async createKeyword(word) {
        return await this.collection.insertOne({ word });
    }
}

module.exports = CompanyKeywordModel;
