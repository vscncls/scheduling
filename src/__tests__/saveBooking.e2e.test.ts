import { sql } from "slonik";
import { fastifyServer } from "../fastifyServer";
import { PostgresConnectionPoolSingleton } from "../PostgresConnectionPoolSingleton";
import { ProfessionalAvailabilitiesProvider } from "../ProfessionalAvailabilitiesProvider";
import { Weekdays } from "../Weekdays";

describe("POST /professional/availabilities/:professionalId/book-slot", () => {
  const pool = new PostgresConnectionPoolSingleton().getInstance();
  afterEach(async () => {
    await pool.query(sql`
      DELETE FROM bookings;
      DELETE FROM professional_availabilities;
    `);
  });

  it("Saves booking without conflict", async () => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
    await professionalAvailabilityProvider.save({
      professionalId: "1",
      startTime: "10:00",
      endTime: "16:00",
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
      path: "/professional/availabilities/1/book-slot",
      method: "POST",
      payload: {
        dateTime: "2022-02-02 11:00",
        patientId: "1",
      },
    });

    expect(response.statusCode).toBe(202);
    expect(response.body).toEqual("");
  });

  it("Throws error on conflict", async () => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
    await professionalAvailabilityProvider.save({
      professionalId: "1",
      startTime: "10:00",
      endTime: "16:00",
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

    await fastifyServer.inject({
      path: "/professional/availabilities/1/book-slot",
      method: "POST",
      payload: {
        dateTime: "2022-02-02 11:00",
        patientId: "1",
      },
    });

    const response = await fastifyServer.inject({
      path: "/professional/availabilities/1/book-slot",
      method: "POST",
      payload: {
        dateTime: "2022-02-02 11:00",
        patientId: "1",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("Throws error if schedule doesn't exist", async () => {
    const response = await fastifyServer.inject({
      path: "/professional/availabilities/1/book-slot",
      method: "POST",
      payload: {
        dateTime: "2022-02-02 11:00",
        patientId: "1",
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
