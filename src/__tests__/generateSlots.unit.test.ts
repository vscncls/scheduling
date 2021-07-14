import { Booking } from "../BookingsProvider";
import { generateSlots } from "../generateSlots";
import { ProfessionalAvailability } from "../ProfessionalAvailability";
import { Weekdays } from "../Weekdays";

describe("Generate slots", () => {
  it("Generates slots within physician availability time range", () => {
    const professionalAvailablity: ProfessionalAvailability = {
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
    };
    const bookings: Booking[] = [];

    const slots = generateSlots("1", new Date("2022-02-02"), new Date("2022-02-02"), bookings, professionalAvailablity);

    expect(slots).toHaveLength(4);
    expect(slots[0].dateTime).toEqual(new Date("2022-02-02 10:00 UTC"));
    expect(slots[1].dateTime).toEqual(new Date("2022-02-02 10:30 UTC"));
    expect(slots[2].dateTime).toEqual(new Date("2022-02-02 11:00 UTC"));
    expect(slots[3].dateTime).toEqual(new Date("2022-02-02 11:30 UTC"));
  });

  it("Sets if slot was booked", () => {
    const professionalAvailablity: ProfessionalAvailability = {
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
    };
    const bookings: Booking[] = [
      {
        professionalId: "1",
        patientId: "1",
        dateTime: new Date("2022-02-02 10:30 UTC"),
      },
    ];

    const slots = generateSlots("1", new Date("2022-02-02"), new Date("2022-02-02"), bookings, professionalAvailablity);

    expect(slots).toHaveLength(4);
    expect(slots[0].booked).toBe(false);
    expect(slots[1].booked).toBe(true);
    expect(slots[2].booked).toBe(true);
    expect(slots[3].booked).toBe(false);
  });

  it("Generates slots for multiple dates", () => {
    const professionalAvailablity: ProfessionalAvailability = {
      professionalId: "1",
      startTime: "10:00",
      endTime: "11:00",
      availableWeekdays: [
        Weekdays.SUNDAY,
        Weekdays.MONDAY,
        Weekdays.TUESDAY,
        Weekdays.WEDNESDAY,
        Weekdays.THURSDAY,
        Weekdays.FRIDAY,
        Weekdays.SATURDAY,
      ],
    };
    const bookings: Booking[] = [];

    const slots = generateSlots("1", new Date("2022-02-02"), new Date("2022-02-04"), bookings, professionalAvailablity);

    expect(slots).toHaveLength(6);
    expect(slots[0].dateTime).toEqual(new Date("2022-02-02 10:00 UTC"));
    expect(slots[1].dateTime).toEqual(new Date("2022-02-02 10:30 UTC"));
    expect(slots[2].dateTime).toEqual(new Date("2022-02-03 10:00 UTC"));
    expect(slots[3].dateTime).toEqual(new Date("2022-02-03 10:30 UTC"));
    expect(slots[4].dateTime).toEqual(new Date("2022-02-04 10:00 UTC"));
    expect(slots[5].dateTime).toEqual(new Date("2022-02-04 10:30 UTC"));
  });

  it("Ignore date if day of week not in availableWeekdays", () => {
    const professionalAvailablity: ProfessionalAvailability = {
      professionalId: "1",
      startTime: "10:00",
      endTime: "11:00",
      availableWeekdays: [Weekdays.WEDNESDAY],
    };
    const bookings: Booking[] = [];

    const slots = generateSlots("1", new Date("2022-02-01"), new Date("2022-02-04"), bookings, professionalAvailablity);

    expect(slots).toHaveLength(2);
    // 2022-02-02 is a wednesday
    expect(slots[0].dateTime).toEqual(new Date("2022-02-02 10:00 UTC"));
    expect(slots[1].dateTime).toEqual(new Date("2022-02-02 10:30 UTC"));
  });
});
