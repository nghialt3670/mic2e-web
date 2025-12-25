import { migrateQuestionsToTemplates } from "../src/actions/survey-actions";

async function main() {
  console.log("Starting survey questions migration...");
  try {
    await migrateQuestionsToTemplates();
    console.log("✓ Migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

main();
