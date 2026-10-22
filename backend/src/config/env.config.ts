import type { EnvironmentConfig } from "./interfaces/env.interface";
import { environmentSchema } from "./schemas/env.schema";

export class EnvConfig {
  public static parseEnvironment(
    environment: Readonly<Record<string, string | undefined>>,
  ): EnvironmentConfig {
    const parsed = environmentSchema.parse(environment);

    return Object.freeze({
      port: parsed.PORT,
      databasePath: parsed.DATABASE_PATH,
      allowedOrigin: parsed.ALLOWED_ORIGIN,
      creatorId: parsed.CREATOR_ID,
      creatorName: parsed.CREATOR_NAME,
    });
  }
}
