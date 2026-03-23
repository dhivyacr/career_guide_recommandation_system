const Career = require("../models/Career");
const careerSeedData = require("./careerSeedData");

async function seedCareersIfEmpty() {
  await Career.bulkWrite(
    careerSeedData.map((career) => ({
      updateOne: {
        filter: { careerName: career.careerName },
        update: { $set: career },
        upsert: true
      }
    }))
  );

  return {
    seeded: true,
    count: await Career.countDocuments()
  };
}

module.exports = {
  seedCareersIfEmpty
};
