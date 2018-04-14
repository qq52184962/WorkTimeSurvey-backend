const express = require("express");
const lodash = require("lodash");
const R = require("ramda");
const { HttpError } = require("../../libs/errors");
const CompanyModel = require("../../models/company_model");
const { getCompanyName } = require("../company_helper");
const wrap = require("../../libs/wrap");
const { combineSelector } = require("../../view_models/helper");

const router = express.Router();

/**
 * @param company
 */
const companyView = combineSelector([
    R.pick(["id", "capital"]),
    company => ({ name: getCompanyName(company.name) }),
]);

/**
 * @param companies
 */
const searchView = R.map(companyView);

/**
 * @api {get} /companies/search Search Company
 * @apiName SearchCompany
 * @apiGroup Company
 * @apiParam {String} key
 * @apiParam {Number} [page=0]
 * @apiSuccess {Object[]} . Companies
 */
router.get(
    "/search",
    wrap(async (req, res) => {
        const search = req.query.key || "";
        const page = req.query.page || 0;

        if (search === "") {
            throw new HttpError("key is required", 422);
            return;
        }

        const query = {
            $or: [
                {
                    name: new RegExp(
                        `^${lodash.escapeRegExp(search.toUpperCase())}`
                    ),
                },
                { id: search },
            ],
        };

        const sort_by = {
            capital: -1,
            type: -1,
            name: 1,
            id: 1,
        };

        const company_model = new CompanyModel(req.db);
        const skip = 25 * page;
        const limit = 25;

        const companies = await company_model.searchCompany(
            query,
            sort_by,
            skip,
            limit
        );

        res.send(searchView(companies));
    })
);

module.exports = router;
