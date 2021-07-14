import { Weekdays } from "./Weekdays";

export type ProfessionalAvailability = {
  professionalId: string;
  availableWeekdays: Weekdays[];
  startTime: string;
  endTime: string;
};
