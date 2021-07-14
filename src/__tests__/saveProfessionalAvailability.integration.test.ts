import { sql } from "slonik";
import { PostgresConnectionPoolSingleton } from "../PostgresConnectionPoolSingleton";
import { ProfessionalAvailabilitiesProvider } from "../ProfessionalAvailabilitiesProvider";
import { Weekdays } from "../Weekdays";

describe("Save professional availability", () => {
  const pool = new PostgresConnectionPoolSingleton().getInstance();
  afterEach(async () => {
    await pool.query(sql`
      DELETE FROM professional_availabilities
    `);
  });

  it("Saves with no conflicts", async () => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
    await professionalAvailabilityProvider.save({
      professionalId: "1",
      startTime: "10:00",
      endTime: "12:00",
      availableWeekdays: [
        Weekdays.SUNDAY,
        Weekdays.MONDAY,
        Weekdays.TUESDAY,
        Weekdays.WEDNESDAY,
        Weekdays.THURSDAY,
        Weekdays.FRIDAY,
        Weekdays.SATURDAY,
      ],
    });

    const result = await pool.query(sql`
      SELECT *
      FROM professional_availabilities
    `);

    expect(result.rows).toHaveLength(1);
  });

  it("Updates if already exists", async () => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
    await professionalAvailabilityProvider.save({
      professionalId: "1",
      startTime: "10:00",
      endTime: "12:00",
      availableWeekdays: [
        Weekdays.SUNDAY,
        Weekdays.MONDAY,
        Weekdays.TUESDAY,
        Weekdays.WEDNESDAY,
        Weekdays.THURSDAY,
        Weekdays.FRIDAY,
        Weekdays.SATURDAY,
      ],
    });
    await professionalAvailabilityProvider.save({
      professionalId: "1",
      startTime: "13:00",
      endTime: "15:00",
      availableWeekdays: [
        Weekdays.SUNDAY,
        Weekdays.MONDAY,
        Weekdays.TUESDAY,
        Weekdays.WEDNESDAY,
        Weekdays.THURSDAY,
        Weekdays.FRIDAY,
        Weekdays.SATURDAY,
      ],
    });

    const result = await pool.query(sql`
      SELECT *
      FROM professional_availabilities
    `);

    expect(result.rows).toHaveLength(1);
  });
});
