import { BookingsProvider } from "./BookingsProvider";
import { generateSlots } from "./generateSlots";
import { ProfessionalAvailabilitiesProvider } from "./ProfessionalAvailabilitiesProvider";
import { Slot } from "./Slot";

export class SlotsQuery {
  private professionalAvailabilityProvider: ProfessionalAvailabilitiesProvider;
  private bookingsProvider: BookingsProvider;

  constructor(
    professionalAvailabilityProvider: ProfessionalAvailabilitiesProvider,
    bookingsProvider: BookingsProvider
  ) {
    this.professionalAvailabilityProvider = professionalAvailabilityProvider;
    this.bookingsProvider = bookingsProvider;
  }

  public async fetchSlotsByPhysicianAndRange(professionalId: string, startDate: Date, endDate: Date): Promise<Slot[]> {
    const professionalAvailability = await this.professionalAvailabilityProvider.getByProfessionalId(professionalId);
    const bookings = await this.bookingsProvider.getByProfessionalIdAndDateRange(professionalId, startDate, endDate);

    const slots = generateSlots(professionalId, startDate, endDate, bookings, professionalAvailability);

    return slots;
  }
}
