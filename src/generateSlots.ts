import { Booking } from "./BookingsProvider";
import { getDayOfWeek } from "./getDayOfWeek";
import { ProfessionalAvailability } from "./ProfessionalAvailability";
import { Slot } from "./Slot";

export const generateSlots = (
  professionalId: string,
  startDate: Date,
  endDate: Date,
  bookings: Booking[],
  professionalAvailability: ProfessionalAvailability
): Slot[] => {
  const [professionalAvailabilityStartHour, professionalAvailabilityStartMinute] = professionalAvailability.startTime
    .split(":")
    .map((num) => parseInt(num));

  const [professionalAvailabilityEndHour, professionalAvailabilityEndMinute] = professionalAvailability.endTime
    .split(":")
    .map((num) => parseInt(num));

  const slots: Slot[] = [];
  const dateCursor = new Date(startDate);
  while (dateCursor <= endDate) {
    if (!professionalAvailability.availableWeekdays.includes(getDayOfWeek(dateCursor))) {
      dateCursor.setDate(dateCursor.getDate() + 1);
      continue;
    }

    const timeCursor = new Date(
      Date.UTC(
        dateCursor.getFullYear(),
        dateCursor.getMonth(),
        dateCursor.getDate() + 1,
        professionalAvailabilityStartHour,
        professionalAvailabilityStartMinute
      )
    );
    const endTime = new Date(
      Date.UTC(
        dateCursor.getFullYear(),
        dateCursor.getMonth(),
        dateCursor.getDate() + 1,
        professionalAvailabilityEndHour,
        professionalAvailabilityEndMinute
      )
    );
    while (timeCursor < endTime) {
      const existingBooking = bookings.find((booking) => {
        const ThirtyMinutesInMs = 1800000;
        return (
          booking.dateTime.getTime() === timeCursor.getTime() ||
          booking.dateTime.getTime() === timeCursor.getTime() - ThirtyMinutesInMs
        );
      });
      slots.push({
        dateTime: new Date(timeCursor),
        patientId: existingBooking?.patientId || null,
        professionalId: professionalId,
        booked: !!existingBooking,
      });

      timeCursor.setMinutes(timeCursor.getMinutes() + 30);
    }
    dateCursor.setDate(dateCursor.getDate() + 1);
  }

  return slots;
};
