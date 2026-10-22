import { z } from "zod";
import { creatorIdSchema } from "../../presentation/http/schemas/followers.schema";

export const allowedOriginSchema = z
  .url()
  .refine(
    (value) => new URL(value).origin === value,
    "ALLOWED_ORIGIN must be an origin",
  );

export const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  DATABASE_PATH: z.string().trim().min(1).default("./data/followers.sqlite"),
  ALLOWED_ORIGIN: allowedOriginSchema.default("http://localhost:5173"),
  CREATOR_ID: creatorIdSchema.default("creator-1"),
  CREATOR_NAME: z.string().trim().min(1).default("Criadora em destaque"),
});
