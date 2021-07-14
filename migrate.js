const { SlonikMigrator } = require("@slonik/migrator");
const { createPool } = require("slonik");
const dotenv = require("dotenv");

dotenv.config();

const slonik = createPool(process.env.POSTGRES_URI);

const migrator = new SlonikMigrator({
  migrationsPath: `${__dirname}/migrations`,
  migrationTableName: "migration",
  slonik,
});

migrator.runAsCLI();
