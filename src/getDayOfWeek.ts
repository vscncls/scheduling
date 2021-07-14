import { Weekdays } from "./Weekdays";

export const getDayOfWeek = (date: Date): Weekdays => {
  const dayOfWeekMap: { [key: number]: Weekdays } = {
    0: Weekdays.MONDAY,
    1: Weekdays.TUESDAY,
    2: Weekdays.WEDNESDAY,
    3: Weekdays.THURSDAY,
    4: Weekdays.FRIDAY,
    5: Weekdays.SATURDAY,
    6: Weekdays.SUNDAY,
  };
  return dayOfWeekMap[date.getDay()];
};
