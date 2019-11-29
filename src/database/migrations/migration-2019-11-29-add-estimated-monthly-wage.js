module.exports = async db => {
    const collection = await db.collection("workings");

    // update hour
    await collection
        .find({
            estimated_hourly_wage: { $exists: true },
            day_real_work_time: { $exists: true },
            week_work_time: { $exists: true },
            "salary.type": "hour",
        })
        .forEach(function(doc) {
            doc.estimated_monthly_wage =
                (doc.salary.amount *
                    (52 * doc.week_work_time - 19 * doc.day_real_work_time)) /
                12;
            db.workings.updateOne(doc);
        });
    // update day
    await collection
        .find({
            estimated_hourly_wage: { $exists: true },
            day_real_work_time: { $exists: true },
            week_work_time: { $exists: true },
            "salary.type": "day",
        })
        .forEach(function(doc) {
            doc.estimated_monthly_wage =
                ((doc.salary.amount / doc.day_real_work_time) *
                    (52 * doc.week_work_time - 19 * doc.day_real_work_time)) /
                12;
            db.workings.updateOne(doc);
        });
    // update month
    await collection
        .find({
            estimated_hourly_wage: { $exists: true },
            "salary.type": "month",
        })
        .forEach(function(doc) {
            doc.estimated_monthly_wage = doc.salary.amount;
            db.workings.updateOne(doc);
        });
    // update year
    await collection
        .find({
            estimated_hourly_wage: { $exists: true },
            "salary.type": "year",
        })
        .forEach(function(doc) {
            doc.estimated_monthly_wage = doc.salary.amount / 12;
            db.workings.updateOne(doc);
        });
};
