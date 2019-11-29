module.exports = async db => {
    const collection = await db.collection("workings");

    // update hour
    const hourRecords = await collection
        .find({
            estimated_hourly_wage: { $exists: true },
            day_real_work_time: { $exists: true },
            week_work_time: { $exists: true },
            "salary.type": "hour",
        })
        .toArray();
    const hourOps = collection.initializeOrderedBulkOp();
    for (let record of hourRecords) {
        const salary = record.salary.amount;
        const weekWorkTime = record.week_work_time;
        const realWorkTime = record.day_real_work_time;
        hourOps.find({ _id: record._id }).update({
            $set: {
                estimated_monthly_wage:
                    (salary * (52 * weekWorkTime - 19 * realWorkTime)) / 12,
            },
        });
    }
    const hourOpsResult = await hourOps.execute();
    console.log("Update [salaryType=hour] ok:", hourOpsResult.ok);
    console.log("nModified:", hourOpsResult.nModified);

    // update day
    const dayRecords = await collection
        .find({
            estimated_hourly_wage: { $exists: true },
            day_real_work_time: { $exists: true },
            week_work_time: { $exists: true },
            "salary.type": "day",
        })
        .toArray();
    const dayOps = collection.initializeOrderedBulkOp();
    for (let record of dayRecords) {
        const salary = record.salary.amount;
        const weekWorkTime = record.week_work_time;
        const realWorkTime = record.day_real_work_time;
        dayOps.find({ _id: record._id }).update({
            $set: {
                estimated_monthly_wage:
                    ((salary / realWorkTime) *
                        (52 * weekWorkTime - 19 * realWorkTime)) /
                    12,
            },
        });
    }
    const dayOpsResult = await dayOps.execute();
    console.log("Update [salaryType=day] ok:", dayOpsResult.ok);
    console.log("nModified:", dayOpsResult.nModified);

    // update month
    const monthRecords = await collection
        .find({
            estimated_hourly_wage: { $exists: true },
            "salary.type": "month",
        })
        .toArray();
    const monthOps = collection.initializeOrderedBulkOp();
    for (let record of monthRecords) {
        const salary = record.salary.amount;
        monthOps.find({ _id: record._id }).update({
            $set: {
                estimated_monthly_wage: salary,
            },
        });
    }
    const monthOpsResult = await monthOps.execute();
    console.log("Update [salaryType=month] ok:", monthOpsResult.ok);
    console.log("nModified:", monthOpsResult.nModified);

    // update year
    const yearRecords = await collection
        .find({
            estimated_hourly_wage: { $exists: true },
            "salary.type": "year",
        })
        .toArray();
    const yearOps = collection.initializeOrderedBulkOp();
    for (let record of yearRecords) {
        const salary = record.salary.amount;
        yearOps.find({ _id: record._id }).update({
            $set: {
                estimated_monthly_wage: salary / 12,
            },
        });
    }
    const yearOpsResult = await yearOps.execute();
    console.log("Update [salaryType=year] ok:", yearOpsResult.ok);
    console.log("nModified:", yearOpsResult.nModified);
};
