import { sql } from "slonik";
import { PostgresConnectionPoolSingleton } from "../PostgresConnectionPoolSingleton";
import { ProfessionalAvailabilitiesProvider } from "../ProfessionalAvailabilitiesProvider";
import { Weekdays } from "../Weekdays";
import { fastifyServer } from "../fastifyServer";

describe("PUT /professional/availabilities", () => {
  const pool = new PostgresConnectionPoolSingleton().getInstance();
  afterEach(async () => {
    await pool.query(sql`
      DELETE FROM professional_availabilities
    `);
  });

  it("Saves", async () => {
    const response = await fastifyServer.inject({
      path: "/professional/availabilities",
      method: "PUT",
      payload: {
        professionalId: "1",
        availableWeekdays: ["MONDAY", "TUESDAY"],
        startTime: "11:00",
        endTime: "15:00",
      },
    });

    expect(response.statusCode).toBe(202);
    expect(response.body).toEqual("");
  });

  it("Doesnt error if already exists", async () => {
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

    const response = await fastifyServer.inject({
      path: "/professional/availabilities",
      method: "PUT",
      payload: {
        professionalId: "1",
        availableWeekdays: ["MONDAY", "TUESDAY"],
        startTime: "11:00",
        endTime: "15:00",
      },
    });

    expect(response.statusCode).toBe(202);
    expect(response.body).toEqual("");
  });
});
