import { z } from "zod";

const identifierPattern = /^[A-Za-z0-9_-]{1,64}$/;

export const creatorIdSchema = z.string().regex(identifierPattern);
export const userIdSchema = z.string().regex(identifierPattern);

export const followRequestBodySchema = z
  .object({
    userId: userIdSchema,
  })
  .strict();
