CREATE TABLE IF NOT EXISTS professional_availabilities (
  "professional_id" TEXT NOT NULL UNIQUE,
  "available_weekdays" TEXT [] NOT NULL,
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL
);
