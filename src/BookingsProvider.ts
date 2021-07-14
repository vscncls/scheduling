import { DatabasePoolType, sql } from "slonik";
import { BookSessionCommandParams } from "./BookSessionCommand";
import { PostgresConnectionPoolSingleton } from "./PostgresConnectionPoolSingleton";

type BookingDb = {
  professional_id: string;
  date_time: Date;
  patient_id: string;
};

export type Booking = {
  professionalId: string;
  dateTime: Date;
  patientId: string;
};

export class ConflictingBookings extends Error {}

export class BookingsProvider {
  private pool: DatabasePoolType;
  constructor() {
    this.pool = new PostgresConnectionPoolSingleton().getInstance();
  }

  public async save(booking: BookSessionCommandParams): Promise<void> {
    const hourInMiliseconds = 60 * 60 * 1000;
    const minDateConflict = new Date(booking.dateTime.getTime() - hourInMiliseconds);
    const maxDateConflict = new Date(booking.dateTime.getTime() + hourInMiliseconds);
    await this.pool.transaction(async (connection) => {
      const conflictingBookings = await connection.query<BookingDb>(sql`
        SELECT *
        FROM bookings
        WHERE date_time > ${minDateConflict.toISOString()} AND date_time < ${maxDateConflict.toISOString()}
        FOR UPDATE
      `);

      if (conflictingBookings.rows.length > 0) {
        throw new ConflictingBookings();
      }

      return await connection.query(sql`
        INSERT INTO bookings (professional_id, date_time, patient_id)
        VALUES (
          ${booking.professionalId},
          ${booking.dateTime.toISOString()},
          ${booking.patientId}
        )
      `);
    });
  }

  public async getByProfessionalIdAndDateRange(
    professionalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Booking[]> {
    endDate = new Date(endDate);
    endDate.setHours(endDate.getHours() + 24);
    const savedBookings = await this.pool.query<BookingDb>(sql`
      SELECT *
      FROM bookings
      WHERE
        professional_id = ${professionalId} AND
        date_time >= ${startDate.toISOString()} AND
        date_time <= ${endDate.toISOString()}
    `);

    return savedBookings.rows.map((dbBooking) => ({
      professionalId: dbBooking.professional_id,
      dateTime: dbBooking.date_time,
      patientId: dbBooking.patient_id,
    }));
  }
}
