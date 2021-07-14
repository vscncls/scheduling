import fastify from "fastify";
import { BookingsProvider, ConflictingBookings } from "./BookingsProvider";
import { BookSessionCommand, UnavailableBookingTime } from "./BookSessionCommand";
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

server.addSchema({
  $id: "createProfessionalAvailability",
  type: "object",
  properties: {
    professionalId: { type: "string" },
    availableWeekdays: {
      type: "array",
      items: {
        type: "string",
        pattern: "^(SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)$",
      },
    },
    startTime: {
      type: "string",
      format: "time",
    },
    endTime: {
      type: "string",
      format: "time",
    },
  },
});

server.addSchema({
  $id: "createBooking",
  type: "object",
  properties: {
    professionalId: { type: "string" },
    dateTime: {
      type: "string",
      format: "date-time",
    },
  },
});

server.addSchema({
  $id: "getProfessionalSlots",
  type: "object",
  properties: {
    startDate: {
      type: "string",
      format: "date",
    },
    endDate: {
      type: "string",
      format: "date",
    },
  },
});

server.put<{ Body: ProfessionalAvailability }>(
  "/professional/availabilities",
  { schema: { body: { $ref: "createProfessionalAvailability#" } } },
  async (req, res) => {
    const professionalAvailabilitiesProvider = new ProfessionalAvailabilitiesProvider();
    await professionalAvailabilitiesProvider.save(req.body);

    res.code(202);
    res.send();
  }
);

server.get<{ Params: { professionalId: string } }>("/professional/availabilities/:professionalId", async (req, res) => {
  const professionalAvailabilitiesProvider = new ProfessionalAvailabilitiesProvider();
  let professionalAvailability: ProfessionalAvailability;
  try {
    professionalAvailability = await professionalAvailabilitiesProvider.getByProfessionalId(req.params.professionalId);
  } catch (err) {
    if (err instanceof ProfessionalAvailabilityNotFound) {
      res.code(404);
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

server.post<createBookingRequest>(
  "/professional/availabilities/:professionalId/book-slot",
  { schema: { body: { $ref: "createBooking#" } } },
  async (req, res) => {
    const dateTime = new Date(req.body.dateTime);
    const bookSessionCommand = new BookSessionCommand(new ProfessionalAvailabilitiesProvider(), new BookingsProvider());
    try {
      await bookSessionCommand.execute({
        dateTime,
        professionalId: req.params.professionalId,
        patientId: req.body.patientId,
      });
    } catch (err) {
      if (err instanceof UnavailableBookingTime || err instanceof ConflictingBookings) {
        res.code(400);
        res.send({ message: "Unavailable time" });
        return;
      }

      if (err instanceof ProfessionalAvailabilityNotFound) {
        res.code(400);
        res.send({ message: "Professional not registered" });
      }

      throw err;
    }

    res.code(202);
    res.send();
  }
);

type getProfessionalSlots = { Params: { professionalId: string }; Querystring: { startDate: string; endDate: string } };

server.get<getProfessionalSlots>(
  "/professional/availabilities/:professionalId/slots",
  { schema: { querystring: { $ref: "getProfessionalSlots#" } } },
  async (req, res) => {
    const professionalAvailabilityProvider = new ProfessionalAvailabilitiesProvider();
    const bookingsProvider = new BookingsProvider();
    const slotsQuery = new SlotsQuery(professionalAvailabilityProvider, bookingsProvider);
    const slots = await slotsQuery.fetchSlotsByPhysicianAndRange(
      req.params.professionalId,
      new Date(req.query.startDate),
      new Date(req.query.endDate)
    );

    res.send(slots);
  }
);

export { server as fastifyServer };
