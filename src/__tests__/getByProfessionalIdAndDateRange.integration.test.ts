import { sql } from "slonik";
import { BookingsProvider } from "../BookingsProvider";
import { PostgresConnectionPoolSingleton } from "../PostgresConnectionPoolSingleton";

describe("Query bookings by professional and date range", () => {
  afterEach(async () => {
    const pool = new PostgresConnectionPoolSingleton().getInstance();
    await pool.query(sql`
      DELETE FROM bookings;
    `);
  });

  it("fetches all bookings in range", async () => {
    const bookingsProvider = new BookingsProvider();
    await bookingsProvider.save({
      dateTime: new Date("2022-02-02 10:00"),
      patientId: "1",
      professionalId: "1",
    });
    await bookingsProvider.save({
      dateTime: new Date("2022-02-01 11:00"),
      patientId: "1",
      professionalId: "1",
    });
    await bookingsProvider.save({
      dateTime: new Date("2022-02-03 12:00"),
      patientId: "1",
      professionalId: "1",
    });
    await bookingsProvider.save({
      dateTime: new Date("2022-01-31 13:00"),
      patientId: "1",
      professionalId: "1",
    });
    await bookingsProvider.save({
      dateTime: new Date("2022-02-04 14:00"),
      patientId: "1",
      professionalId: "1",
    });

    const bookings = await bookingsProvider.getByProfessionalIdAndDateRange(
      "1",
      new Date("2022-02-01"),
      new Date("2022-02-03")
    );

    expect(bookings).toHaveLength(3);
  });

  it("only fecthes books with the specified id", async () => {
    const bookingsProvider = new BookingsProvider();
    await bookingsProvider.save({
      dateTime: new Date("2022-02-02 10:00"),
      patientId: "1",
      professionalId: "10",
    });
    await bookingsProvider.save({
      dateTime: new Date("2022-02-01 11:00"),
      patientId: "1",
      professionalId: "10",
    });
    await bookingsProvider.save({
      dateTime: new Date("2022-02-03 12:00"),
      patientId: "1",
      professionalId: "3",
    });
    await bookingsProvider.save({
      dateTime: new Date("2022-01-31 13:00"),
      patientId: "1",
      professionalId: "5",
    });
    await bookingsProvider.save({
      dateTime: new Date("2022-02-04 14:00"),
      patientId: "1",
      professionalId: "1",
    });

    const bookings = await bookingsProvider.getByProfessionalIdAndDateRange(
      "10",
      new Date("2020-02-01"),
      new Date("2024-02-03")
    );

    expect(bookings).toHaveLength(2);
  });
});
