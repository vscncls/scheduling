import { sql } from "slonik";
import { PostgresConnectionPoolSingleton } from "../PostgresConnectionPoolSingleton";
import {
  ProfessionalAvailabilitiesProvider,
  ProfessionalAvailabilityNotFound,
} from "../ProfessionalAvailabilitiesProvider";
import { Weekdays } from "../Weekdays";

describe("Get professional availability by professional id", () => {
  const pool = new PostgresConnectionPoolSingleton().getInstance();
  afterEach(async () => {
    await pool.query(sql`
      DELETE FROM professional_availabilities
    `);
  });

  it("Get when physician exists in DB", async () => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
    await professionalAvailabilityProvider.save({
      professionalId: "1",
      startTime: "10:00",
      endTime: "12:00",
      availableWeekdays: [Weekdays.SUNDAY, Weekdays.MONDAY],
    });

    const professionalAvailablity = await professionalAvailabilityProvider.getByProfessionalId("1");

    expect(professionalAvailablity).toEqual({
      professionalId: "1",
      availableWeekdays: [Weekdays.SUNDAY, Weekdays.MONDAY],
      startTime: "10:00",
      endTime: "12:00",
    });
  });

  it("Throw error if professional doesn't exist", async () => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();

    await expect(
      (async () => {
        await professionalAvailabilityProvider.getByProfessionalId("1");
      })()
    ).rejects.toThrowError(ProfessionalAvailabilityNotFound);
  });
});
