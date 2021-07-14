import { BookingsProvider } from "./BookingsProvider";
import { getDayOfWeek } from "./getDayOfWeek";
import { ProfessionalAvailabilitiesProvider } from "./ProfessionalAvailabilitiesProvider";
import { ProfessionalAvailability } from "./ProfessionalAvailability";

export type BookSessionCommandParams = {
  professionalId: string;
  dateTime: Date;
  patientId: string;
};

export class UnavailableBookingTime extends Error {}

export class BookSessionCommand {
  private professionalAvailabilitiesProvider: ProfessionalAvailabilitiesProvider;
  private bookingsProvider: BookingsProvider;

  private SESSION_TIME = 1;

  constructor(
    professionalAvailabilitiesProvider: ProfessionalAvailabilitiesProvider,
    bookingsProvider: BookingsProvider
  ) {
    this.professionalAvailabilitiesProvider = professionalAvailabilitiesProvider;
    this.bookingsProvider = bookingsProvider;
  }

  public async execute(params: BookSessionCommandParams): Promise<void> {
    const professionalAvailability = await this.professionalAvailabilitiesProvider.getByProfessionalId(
      params.professionalId
    );
    if (
      !professionalAvailability.availableWeekdays.includes(getDayOfWeek(params.dateTime)) ||
      !this.isTimeInRange(params.dateTime, professionalAvailability)
    ) {
      throw new UnavailableBookingTime();
    }

    await this.bookingsProvider.save(params);
  }

  private isTimeInRange(target: Date, professionalAvailability: ProfessionalAvailability) {
    const targetDate = new Date(`01/01/1971 ${target.getHours()}:${target.getMinutes()}`);
    const startDate = new Date(`01/01/1971 ${professionalAvailability.startTime}`);
    const endDate = new Date(`01/01/1971 ${professionalAvailability.endTime}`);
    endDate.setHours(endDate.getHours() - this.SESSION_TIME);

    return targetDate >= startDate && targetDate <= endDate;
  }
}
