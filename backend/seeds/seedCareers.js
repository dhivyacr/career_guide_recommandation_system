const connectDB = require("../config/db");
const Career = require("../models/Career");
const careerSeedData = require("./careerSeedData");

async function seedCareersIfEmpty() {
  const existingCount = await Career.countDocuments();
  if (existingCount > 0) {
    return { seeded: false, count: existingCount };
  }

  await Career.insertMany(careerSeedData);
  return { seeded: true, count: careerSeedData.length };
}

async function runSeedScript() {
  try {
    await connectDB();
    const result = await seedCareersIfEmpty();
    if (result.seeded) {
      console.log(`Careers seeded: ${result.count}`);
    } else {
      console.log(`Careers already exist: ${result.count}`);
    }
    process.exit(0);
  } catch (error) {
    console.error("Career seeding failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeedScript();
}

module.exports = {
  seedCareersIfEmpty
};
