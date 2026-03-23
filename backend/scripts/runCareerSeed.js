const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../config/db");
const { seedCareersIfEmpty } = require("../seeds/seedCareers");

async function runCareerSeed() {
  try {
    await connectDB();
    const result = await seedCareersIfEmpty();
    console.log(`Careers seeded: ${result.count}`);
    process.exit(0);
  } catch (error) {
    console.error("Career seeding failed", error);
    process.exit(1);
  }
}

runCareerSeed();
