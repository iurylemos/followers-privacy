import { describe, expect, it } from 'vitest';
import { parseEnvironment } from '../../src/config/env';
import {
  creatorIdSchema,
  userIdSchema,
} from '../../src/presentation/http/schemas/followers.schema';

describe('identifier schemas', () => {
  it('accepts the configured creator and a valid user identifier', () => {
    expect(creatorIdSchema.safeParse('creator-1').success).toBe(true);
    expect(userIdSchema.safeParse('reader_42').success).toBe(true);
    expect(userIdSchema.safeParse('x'.repeat(64)).success).toBe(true);
  });

  it.each(['', ' has-space', 'has space', 'ümlaut', 'a'.repeat(65)])(
    'rejects an invalid identifier: %s',
    (identifier) => {
      expect(userIdSchema.safeParse(identifier).success).toBe(false);
    },
  );

  it('provides documented development defaults', () => {
    expect(parseEnvironment({})).toEqual({
      port: 3000,
      databasePath: './data/followers.sqlite',
      allowedOrigin: 'http://localhost:5173',
      creatorId: 'creator-1',
      creatorName: 'Criadora em destaque',
    });
  });

  it('rejects invalid port, origin, or creator configuration', () => {
    expect(() => parseEnvironment({ PORT: '0' })).toThrow();
    expect(() => parseEnvironment({ ALLOWED_ORIGIN: 'not-a-url' })).toThrow();
    expect(() => parseEnvironment({ CREATOR_ID: 'creator/1' })).toThrow();
  });
});
