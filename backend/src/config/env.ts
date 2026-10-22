import { z } from 'zod';
import { creatorIdSchema } from '../presentation/http/schemas/followers.schema';

const allowedOriginSchema = z
  .url()
  .refine((value) => new URL(value).origin === value, 'ALLOWED_ORIGIN must be an origin');

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  DATABASE_PATH: z.string().trim().min(1).default('./data/followers.sqlite'),
  ALLOWED_ORIGIN: allowedOriginSchema.default('http://localhost:5173'),
  CREATOR_ID: creatorIdSchema.default('creator-1'),
  CREATOR_NAME: z.string().trim().min(1).default('Criadora em destaque'),
});

export type EnvironmentConfig = Readonly<{
  port: number;
  databasePath: string;
  allowedOrigin: string;
  creatorId: string;
  creatorName: string;
}>;

export function parseEnvironment(
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
