import { sql } from "slonik";
import { PostgresConnectionPoolSingleton } from "../PostgresConnectionPoolSingleton";
import { ProfessionalAvailabilitiesProvider } from "../ProfessionalAvailabilitiesProvider";

describe("Delete professional availability by id", () => {
  const pool = new PostgresConnectionPoolSingleton().getInstance();

  it("Deletes when professional availability exists", async () => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
    professionalAvailabilityProvider.save({
      professionalId: "1",
      availableWeekdays: [],
      startTime: "10:10",
      endTime: "12:00",
    });

    await professionalAvailabilityProvider.deleteById("1");

    const result = await pool.query(sql`
      SELECT * FROM professional_availabilities
    `);
    expect(result.rows).toHaveLength(0);
  });

  it("Doesnt fail if availability doesn't exist", async () => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
    await expect(
      (async () => {
        await professionalAvailabilityProvider.deleteById("1");
      })()
    ).resolves.not.toThrow();
  });
});
