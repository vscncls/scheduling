import { sql } from "slonik";
import { BookingsProvider, ConflictingBookings } from "../BookingsProvider";
import { PostgresConnectionPoolSingleton } from "../PostgresConnectionPoolSingleton";

describe("Save booking", () => {
  const pool = new PostgresConnectionPoolSingleton().getInstance();
  afterEach(async () => {
    await pool.query(sql`
      DELETE FROM bookings;
    `);
  });

  it("Saves booking without conflict", async () => {
    const bookingsProvider = new BookingsProvider();
    await bookingsProvider.save({
      dateTime: new Date("2022-02-02 10:00"),
      patientId: "1",
      professionalId: "1",
    });

    const result = await pool.query(sql`
      SELECT *
      FROM bookings
      WHERE professional_id = '1'
    `);
    expect(result.rows).toHaveLength(1);
  });

  it("Throws error on conflict", async () => {
    const bookingsProvider = new BookingsProvider();
    await bookingsProvider.save({
      dateTime: new Date("2022-02-02 10:00"),
      patientId: "1",
      professionalId: "1",
    });

    await expect(
      (async () => {
        await bookingsProvider.save({
          dateTime: new Date("2022-02-02 10:00"),
          patientId: "1",
          professionalId: "1",
        });
      })()
    ).rejects.toThrowError(ConflictingBookings);
  });
});
