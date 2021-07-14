import { createPool, DatabasePoolType, TypeParserType } from "slonik";

const UTCTimestampParser: TypeParserType = {
  name: "timestamp",
  parse: (value) => new Date(`${value} UTC`),
};

export class PostgresConnectionPoolSingleton {
  private static instance: DatabasePoolType;
  public getInstance(): DatabasePoolType {
    if (!PostgresConnectionPoolSingleton.instance) {
      PostgresConnectionPoolSingleton.instance = createPool(process.env.POSTGRES_URI || "", {
        typeParsers: [UTCTimestampParser],
      });
    }

    return PostgresConnectionPoolSingleton.instance;
  }
}
