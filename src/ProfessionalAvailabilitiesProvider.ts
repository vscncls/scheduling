import { DatabasePoolType, NotFoundError, sql } from "slonik";
import { PostgresConnectionPoolSingleton } from "./PostgresConnectionPoolSingleton";
import { ProfessionalAvailability } from "./ProfessionalAvailability";
import { Weekdays } from "./Weekdays";

type ProfessionalAvailabilityDb = {
  professional_id: string;
  available_weekdays: string[];
  start_time: string;
  end_time: string;
};

export class ProfessionalAvailabilityNotFound extends Error {}

export class ProfessionalAvailabilitiesProvider {
  private pool: DatabasePoolType;
  constructor() {
    this.pool = new PostgresConnectionPoolSingleton().getInstance();
  }

  public async save(professionalAvailability: ProfessionalAvailability): Promise<void> {
    await this.pool.connect(async (connection) => {
      return connection.query(sql`
        INSERT INTO professional_availabilities (
          professional_id,
          available_weekdays,
          start_time,
          end_time
        )
        VALUES (
          ${professionalAvailability.professionalId},
          ${sql.array(professionalAvailability.availableWeekdays, "text")},
          ${professionalAvailability.startTime},
          ${professionalAvailability.endTime}
        )
        ON CONFLICT(professional_id) DO UPDATE
        SET
            available_weekdays = ${sql.array(professionalAvailability.availableWeekdays, "text")},
            start_time = ${professionalAvailability.startTime},
            end_time = ${professionalAvailability.endTime}
      `);
    });
  }

  public async getByProfessionalId(id: string): Promise<ProfessionalAvailability> {
    try {
      const result = await this.pool.one<ProfessionalAvailabilityDb>(sql`
        SELECT *
        FROM professional_availabilities
        WHERE professional_id = ${id}
      `);
      return {
        professionalId: result.professional_id,
        availableWeekdays: result.available_weekdays as Weekdays[],
        startTime: result.start_time.slice(0, 5),
        endTime: result.end_time.slice(0, 5),
      };
    } catch (err: unknown) {
      if (err instanceof NotFoundError) {
        throw new ProfessionalAvailabilityNotFound();
      }

      throw err;
    }
  }

  public async deleteById(id: string): Promise<void> {
    await this.pool.query(sql`
      DELETE FROM professional_availabilities
      WHERE professional_id = ${id}
    `);
  }
}
