import { fastifyServer } from "../fastifyServer";
import { ProfessionalAvailabilitiesProvider } from "../ProfessionalAvailabilitiesProvider";

describe("Delete professional availability by id", () => {
  it("Deletes when professional availability exists", async () => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
    professionalAvailabilityProvider.save({
      professionalId: "1",
      availableWeekdays: [],
      startTime: "10:10",
      endTime: "12:00",
    });

    const response = await fastifyServer.inject({
      path: "/professional/availabilities/1",
      method: "DELETE",
    });

    expect(response.statusCode).toBe(200);
  });

  it("Doesnt fail if availability doesn't exist", async () => {
    const response = await fastifyServer.inject({
      path: "/professional/availabilities/1",
      method: "DELETE",
    });

    expect(response.statusCode).toBe(200);
  });
});
