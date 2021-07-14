import fastify from "fastify";
import { BookingsProvider } from "./BookingsProvider";
import { BookSessionCommand } from "./BookSessionCommand";
import { LoggerSingleton } from "./LoggerSingleton";
import {
  ProfessionalAvailabilitiesProvider,
  ProfessionalAvailabilityNotFound,
} from "./ProfessionalAvailabilitiesProvider";
import { ProfessionalAvailability } from "./ProfessionalAvailability";
import { SlotsQuery } from "./SlotsQuery";

const logger = new LoggerSingleton().getInstance();
const server = fastify({
  logger,
});

server.put<{ Body: ProfessionalAvailability }>("/professional/availabilities", async (req, res) => {
  const professionalAvailabilitiesProvider = new ProfessionalAvailabilitiesProvider();
  await professionalAvailabilitiesProvider.save(req.body);

  res.code(202);
  res.send();
});

server.get<{ Params: { professionalId: string } }>("/professional/availabilities/:professionalId", async (req, res) => {
  const professionalAvailabilitiesProvider = new ProfessionalAvailabilitiesProvider();
  let professionalAvailability: ProfessionalAvailability;
  try {
    professionalAvailability = await professionalAvailabilitiesProvider.getByProfessionalId(req.params.professionalId);
  } catch (err) {
    if (err instanceof ProfessionalAvailabilityNotFound) {
      res.code(204);
      res.send({ message: "Professional availability not found" });
      return;
    }

    throw err;
  }

  res.send(professionalAvailability);
});

server.delete<{ Params: { professionalId: string } }>(
  "/professional/availabilities/:professionalId",
  async (req, res) => {
    const professionalAvailabilitiesProvider = new ProfessionalAvailabilitiesProvider();
    await professionalAvailabilitiesProvider.deleteById(req.params.professionalId);
    res.code(202);
    res.send();
  }
);

type createBookingRequest = {
  Body: {
    dateTime: string;
    patientId: string;
  };
  Params: {
    professionalId: string;
  };
};

server.post<createBookingRequest>("/professional/availabilities/:professionalId/book-slot", async (req, res) => {
  const dateTime = new Date(req.body.dateTime);
  const bookSessionCommand = new BookSessionCommand(new ProfessionalAvailabilitiesProvider(), new BookingsProvider());
  await bookSessionCommand.execute({
    dateTime,
    professionalId: req.params.professionalId,
    patientId: req.body.patientId,
  });

  res.send();
});

type getProfessionalSlots = { Params: { professionalId: string }; Querystring: { startDate: string; endDate: string } };

server.get<getProfessionalSlots>("/professional/availabilities/:professionalId/slots", async (req, res) => {
  const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
  const bookingsProvider = new BookingsProvider();
  const slotsQuery = new SlotsQuery(professionalAvailabilityProvider, bookingsProvider);
  const slots = await slotsQuery.fetchSlotsByPhysicianAndRange(
    req.params.professionalId,
    new Date(req.query.startDate),
    new Date(req.query.endDate)
  );

  res.send(slots);
});

export { server as fastifyServer };