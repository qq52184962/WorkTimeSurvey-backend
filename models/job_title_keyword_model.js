class JobTitleKeywordModel {
    constructor(manager) {
        this.manager = manager;
        this.collection = manager.db.collection("job_title_keywords");
    }

    async createKeyword(word) {
        return await this.collection.insertOne({ word });
    }
}

module.exports = JobTitleKeywordModel;
