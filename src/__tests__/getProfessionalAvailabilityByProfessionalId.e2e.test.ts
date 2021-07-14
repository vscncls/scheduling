import { sql } from "slonik";
import { fastifyServer } from "../fastifyServer";
import { PostgresConnectionPoolSingleton } from "../PostgresConnectionPoolSingleton";
import { ProfessionalAvailabilitiesProvider } from "../ProfessionalAvailabilitiesProvider";
import { Weekdays } from "../Weekdays";

describe("GET /professional/availabilities/:professionalId", () => {
  const pool = new PostgresConnectionPoolSingleton().getInstance();
  afterEach(async () => {
    await pool.query(sql`
      DELETE FROM professional_availabilities
    `);
  });

  it("Get when physician exists", async () => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
    await professionalAvailabilityProvider.save({
      professionalId: "1",
      startTime: "10:00",
      endTime: "12:00",
      availableWeekdays: [Weekdays.SUNDAY, Weekdays.MONDAY],
    });

    const response = await fastifyServer.inject({
      path: "/professional/availabilities/1",
      method: "GET",
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      professionalId: "1",
      availableWeekdays: ["SUNDAY", "MONDAY"],
      startTime: "10:00",
      endTime: "12:00",
    });
  });

  it("Throw error if professional doesn't exist", async () => {
    const response = await fastifyServer.inject({
      path: "/professional/availabilities/1",
      method: "GET",
    });

    expect(response.statusCode).toBe(404);
  });
});
